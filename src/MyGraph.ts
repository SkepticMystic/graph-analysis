import { Graph } from 'graphlib'
import type {
  App,
  CacheItem,
  HeadingCache,
  ReferenceCache,
  TagCache,
} from 'obsidian'
import { getAllTags, getLinkpath } from 'obsidian'
import tokenizer from 'sbd'
import { clusteringCoefficient, intersection } from 'src/GeneralGraphFn'
import type {
  AnalysisAlg,
  CoCitation,
  CoCitationMap,
  Communities,
  GraphAnalysisSettings,
  ResultMap,
  Subtype,
} from 'src/Interfaces'
import { getCounts, getMaxKey, roundNumber, sum } from 'src/Utility'

export default class MyGraph extends Graph {
  app: App
  settings: GraphAnalysisSettings

  constructor(app: App, settings: GraphAnalysisSettings) {
    super()
    this.app = app
    this.settings = settings
  }

  nodeMapping: { [name: string]: number } = {}

  async initGraph(): Promise<MyGraph> {
    const { resolvedLinks, unresolvedLinks } = this.app.metadataCache
    const { exclusionRegex } = this.settings
    const regex = new RegExp(exclusionRegex, 'i')
    let i = 0
    for (const source in resolvedLinks) {
      if (exclusionRegex === '' || !regex.test(source)) {
        if (source.endsWith(this.settings.allFileExtensions ? '' : 'md')) {
          this.setNode(source, i)
          i++

          for (const dest in resolvedLinks[source]) {
            if (exclusionRegex === '' || !regex.test(dest)) {
              if (dest.endsWith(this.settings.allFileExtensions ? '' : 'md')) {
                this.setEdge(source, dest)
              }
            }
          }
        }
      }
    }

    for (const source in unresolvedLinks) {
      if (exclusionRegex === '' || !regex.test(source)) {
        this.setNode(source, i)
        i++

        for (const dest in unresolvedLinks[source]) {
          const destMD = dest + '.md'
          if (exclusionRegex === '' || !regex.test(destMD)) {
            this.setEdge(source, destMD, 'Unresolved')
          }
        }
      }
    }
    console.log(this.edges().filter((e) => this.edge(e) === 'Unresolved'))
    return this
  }

  algs: {
    [subtype in Subtype]: AnalysisAlg<ResultMap | CoCitationMap | Communities>
  } = {
    Jaccard: async (a: string): Promise<ResultMap> => {
      const Na = (this.neighbors(a) as string[]) ?? []
      const results: ResultMap = {}
      this.nodes().forEach((to) => {
        const Nb = (this.neighbors(to) as string[]) ?? []
        const Nab = intersection(Na, Nb)
        const denom = Na.length + Nb.length - Nab.length
        let measure = denom !== 0 ? roundNumber(Nab.length / denom) : Infinity

        results[to] = { measure, extra: Nab }
      })
      return results
    },

    Overlap: async (a: string): Promise<ResultMap> => {
      const Na = (this.neighbors(a) as string[]) ?? []
      const results: ResultMap = {}
      this.nodes().forEach((to) => {
        const Nb = (this.neighbors(to) as string[]) ?? []
        const Nab = intersection(Na, Nb)
        let measure =
          Na.length !== 0 && Nb.length !== 0
            ? // The square weights the final result by the number of nodes in the overlap
              roundNumber(Nab.length ** 2 / Math.min(Na.length, Nb.length))
            : Infinity

        results[to] = { measure, extra: Nab }
      })
      return results
    },

    'Adamic Adar': async (a: string): Promise<ResultMap> => {
      const Na = this.neighbors(a) as string[]
      const Nofb = this.neighbors('b.md')
      const results: ResultMap = {}
      // Find all edges containing a
      const edges = this.edges().filter((e) => e.v === a || e.w === a)
      console.log({ Na, Nofb })
      this.nodes().forEach((to) => {
        const Nb = this.neighbors(to) as string[]
        const Nab = intersection(Na, Nb)

        if (Nab.length) {
          const neighbours: number[] = Nab.map(
            (node) => (this.successors(node) as string[]).length
          )
          const measure = roundNumber(
            sum(neighbours.map((neighbour) => 1 / Math.log(neighbour)))
          )
          results[to] = { measure, extra: Nab }
        } else {
          results[to] = { measure: Infinity, extra: Nab }
        }
      })
      return results
    },

    'Common Neighbours': async (a: string): Promise<ResultMap> => {
      const Na = this.neighbors(a) as string[]
      const results: ResultMap = {}

      this.nodes().forEach((to) => {
        const Nb = (this.neighbors(to) ?? []) as string[]
        const Nab = intersection(Na, Nb)
        const measure = Nab.length
        results[to] = { measure, extra: Nab }
      })
      return results
    },

    'Co-Citations': async (a: string): Promise<CoCitationMap> => {
      const mdCache = this.app.metadataCache
      const results: CoCitationMap = {}
      const pres = this.predecessors(a) as string[]

      for (const preI in pres) {
        const pre = pres[preI]
        const file = mdCache.getFirstLinkpathDest(pre, '')
        if (!file) continue

        const cache = mdCache.getFileCache(file)

        const preCocitations: { [name: string]: [number, CoCitation[]] } = {}
        const allLinks = [...cache.links]
        if (cache.embeds) {
          allLinks.push(...cache.embeds)
        }
        const ownLinks = allLinks.filter((link) => {
          const linkFile = mdCache.getFirstLinkpathDest(
            getLinkpath(link.link),
            file.path
          )
          if (!linkFile) return false

          const extensionQ =
            this.settings.allFileExtensions || linkFile.extension === 'md'
          return linkFile.path === a && extensionQ
        })

        const cachedRead = await this.app.vault.cachedRead(file)
        const lines = cachedRead.split('\n')

        // Find the sentence the link is in
        const ownSentences: [number, number, number, ReferenceCache][] =
          ownLinks.map((link) => {
            let line = lines[link.position.end.line]
            const sentences = tokenizer.sentences(line, {
              preserve_whitespace: true,
            })
            let aggrSentenceLength = 0
            let res: [number, number, number, ReferenceCache] = null
            sentences.forEach((sentence: string) => {
              if (res) return
              aggrSentenceLength += sentence.length
              // Edge case that does not work: If alias has end of sentences.
              if (link.position.end.col <= aggrSentenceLength) {
                res = [
                  link.position.end.line,
                  aggrSentenceLength - sentence.length,
                  aggrSentenceLength,
                  link,
                ]
              }
            })
            return res
          })

        // Find the section the link is in
        const ownSections = ownLinks.map((link) =>
          cache.sections.find(
            (section) =>
              section.position.start.line <= link.position.start.line &&
              section.position.end.line >= link.position.end.line
          )
        )

        // Find the headings the link is under
        let minHeadingLevel = 7
        let maxHeadingLevel = 0
        const ownHeadings: [HeadingCache, number][] = []
        ownLinks.forEach((link) => {
          if (!cache.headings) return
          cache.headings.forEach((heading, index) => {
            minHeadingLevel = Math.min(minHeadingLevel, heading.level)
            maxHeadingLevel = Math.max(maxHeadingLevel, heading.level)
            // The link falls under this header!
            if (heading.position.start.line <= link.position.start.line) {
              for (const j of Array(cache.headings.length - index - 1).keys()) {
                let nextHeading = cache.headings[j + index + 1]
                // Scan for the next header with at least as low of a level
                if (nextHeading.level >= heading.level) {
                  if (
                    nextHeading.position.start.line <= link.position.start.line
                  )
                    return
                  ownHeadings.push([heading, nextHeading.position.start.line])
                  return
                }
              }
              // No more headers after this one. Use arbitrarily number for length to keep things simple...
              ownHeadings.push([heading, 100000000000])
            }
          })
        })
        minHeadingLevel =
          cache.headings && cache.headings.length > 0 ? minHeadingLevel : 0
        maxHeadingLevel =
          cache.headings && cache.headings.length > 0 ? maxHeadingLevel : 0

        // Intuition of weight: The least specific heading will give the weight 2 + maxHeadingLevel - minHeadingLevel
        // We want to weight it 1 factor less.
        const minScore = 1 / Math.pow(2, 4 + maxHeadingLevel - minHeadingLevel)

        const coCiteCandidates: CacheItem[] = [...allLinks]
        if (cache.tags && this.settings.coTags) {
          coCiteCandidates.push(...cache.tags)
        }
        coCiteCandidates.forEach((item) => {
          let linkPath: string = null
          if ('link' in item) {
            const linkFile = mdCache.getFirstLinkpathDest(
              getLinkpath((item as ReferenceCache)?.link ?? '') ?? '',
              file.path
            )
            if (!linkFile) {
              linkPath = (item as ReferenceCache).link
            }
            // If you don't want to check all extensions AND the extension is not .md, return
            // The negation is, if you want to check all files, OR the extension is .md, then don't return yet
            else if (!this.settings.allFileExtensions && linkFile.extension !== 'md') {
              return
            }
            else {
              // Something is happening here where imgs aren't being added to preCocitations...
              // I think it's because only the basename is being added as a key, but the whole path is needed when accessing it for `results`
              linkPath = linkFile.path
              if (linkPath === a) return
            }
          } else if ('tag' in item) {
            linkPath = (item as TagCache).tag
          } else return

          // Initialize to 0 if not set yet
          if (!(linkPath in preCocitations)) {
            preCocitations[linkPath] = [0, []]
          }

          const lineContent = lines[item.position.start.line]
          // Check if the link is on the same line
          let hasOwnLine = false
          ownSentences.forEach(([line, start, end, ownLink]) => {
            if (item.position.start.line === line) {
              const m1Start = Math.min(
                item.position.start.col,
                ownLink.position.start.col
              )
              const m1End = Math.min(
                item.position.end.col,
                ownLink.position.end.col
              )
              const m2Start = Math.max(
                item.position.start.col,
                ownLink.position.start.col
              )
              const m2End = Math.max(
                item.position.end.col,
                ownLink.position.end.col
              )
              // Break sentence up between the two links
              const sentence = [
                lineContent.slice(0, m1Start),
                lineContent.slice(m1Start, m1End),
                lineContent.slice(m1End, m2Start),
                lineContent.slice(m2Start, m2End),
                lineContent.slice(m2End, lineContent.length),
              ]
              // Give a higher score if it is also in the same sentence
              if (
                item.position.start.col >= start &&
                item.position.end.col <= end
              ) {
                // If it's in the same sentence, remove the other sentences
                sentence[0] = sentence[0].slice(start, sentence[0].length)
                sentence[4] = lineContent.slice(m2End, end)
                preCocitations[linkPath][0] = 1
                preCocitations[linkPath][1].push({
                  sentence: sentence,
                  measure: 1,
                  source: pre,
                  line: item.position.start.line,
                })
              } else {
                preCocitations[linkPath][0] = Math.max(
                  preCocitations[linkPath][0],
                  1 / 2
                )
                preCocitations[linkPath][1].push({
                  sentence: sentence,
                  measure: 1 / 2,
                  source: pre,
                  line: item.position.start.line,
                })
              }
              hasOwnLine = true
            }
          })
          if (hasOwnLine) return

          const sentence = [
            lineContent.slice(0, item.position.start.col),
            lineContent.slice(item.position.start.col, item.position.end.col),
            lineContent.slice(item.position.end.col, lineContent.length),
          ]

          // Check if it is in the same paragraph
          const sameParagraph = ownSections.find(
            (section) =>
              section.position.start.line <= item.position.start.line &&
              section.position.end.line >= item.position.end.line
          )
          if (sameParagraph) {
            preCocitations[linkPath][0] = Math.max(
              preCocitations[linkPath][0],
              1 / 4
            )
            preCocitations[linkPath][1].push({
              sentence: sentence,
              measure: 1 / 4,
              source: pre,
              line: item.position.start.line,
            })
            return
          }

          // Find the best corresponding heading
          const headingMatches = ownHeadings.filter(
            ([heading, end]) =>
              heading.position.start.line <= item.position.start.line &&
              end > item.position.end.line
          )
          if (headingMatches.length > 0) {
            const bestLevel = Math.max(
              ...headingMatches.map(([heading, _]) => heading.level)
            )
            // Intuition: If they are both under the same 'highest'-level heading, they get weight 1/4
            // Then, maxHeadingLevel - bestLevel = 0, so we get 1/(2^2)=1/4. If the link appears only under
            // less specific headings, the weight will decrease.
            const score = 1 / Math.pow(2, 3 + maxHeadingLevel - bestLevel)
            preCocitations[linkPath][0] = Math.max(
              preCocitations[linkPath][0],
              score
            )
            preCocitations[linkPath][1].push({
              measure: score,
              sentence: sentence,
              source: pre,
              line: item.position.start.line,
            })
            return
          }

          // The links appear together in the same document, but not under a shared heading
          preCocitations[linkPath][0] = Math.max(
            preCocitations[linkPath][0],
            minScore
          )
          preCocitations[linkPath][1].push({
            measure: minScore,
            sentence: sentence,
            source: pre,
            line: item.position.start.line,
          })
        })

        if (this.settings.coTags) {
          getAllTags(cache).forEach((tag) => {
            if (!(tag in preCocitations)) {
              // Tag defined in YAML. Gets the lowest score (has no particular position)

              preCocitations[tag] = [
                minScore,
                [
                  {
                    measure: minScore,
                    sentence: ['', '', ''],
                    source: pre,
                    line: 0,
                  },
                ],
              ]
            }
          })
        }

        // Add the found weights to the results
        for (let key in preCocitations) {
          const file = mdCache.getFirstLinkpathDest(key, '')
          let name = null
          let resolved = true
          if (file) {
            name = file.path
            // .slice(0, file.path.length - 3)
          } else if (key[0] === '#') {
            name = key
          } else {
            // Unresolved link
            name = key
            resolved = false
          }
          let cocitation = preCocitations[key]
          if (name in results) {
            results[name].measure += cocitation[0]
            results[name].coCitations.push(...cocitation[1])
          } else {
            results[name] = {
              measure: cocitation[0],
              coCitations: cocitation[1],
              resolved: resolved
            }
          }
        }
      }

      results[a] = { measure: 0, coCitations: [], resolved: false}
      for (const key in results) {
        results[key].coCitations = results[key].coCitations.sort((a, b) =>
          a.measure > b.measure ? -1 : 1
        )
      }
      return results
    },

    'Label Propagation': async (
      a: string,
      options: { iterations: number }
    ): Promise<Communities> => {
      let labeledNodes: { [node: string]: string } = {}
      this.nodes().forEach((node, i) => {
        labeledNodes[node] = node
      })

      for (let i = 0; i < options.iterations; i++) {
        const newLabeledNodes: { [node: string]: string } = {}
        this.nodes().forEach((node) => {
          const neighbours = this.neighbors(node) as string[]

          if (neighbours.length) {
            const neighbourLabels = neighbours.map(
              // Take the label from the not-yet-updated-labels
              (neighbour) => labeledNodes[neighbour]
            )
            const counts = getCounts(neighbourLabels)
            newLabeledNodes[node] = getMaxKey(counts)
          }
        })
        // Update the labels
        labeledNodes = newLabeledNodes
      }

      // Create the communities
      const communities: Communities = {}
      Object.entries(labeledNodes).forEach((labeledNode: [string, string]) => {
        const [node, label] = labeledNode
        if (communities[label] === undefined) {
          communities[label] = [node]
        } else {
          communities[label].push(node)
        }
      })
      return communities
    },

    'Clustering Coefficient': async (a: string): Promise<ResultMap> => {
      const results: ResultMap = {}

      this.nodes().forEach((to: string) => {
        const { coeff, triangles } = clusteringCoefficient(this, to)
        results[to] = {
          measure: roundNumber(coeff),
          extra: triangles.map((group) => group.join(', ')),
        }
      })
      return results
    },

    // 'Closeness': (a: string) => {
    //     const paths = graphlib.alg.dijkstra(this, a);
    //     const results: number[] = []
    //     const nNodes = this.nodes().length

    //     const distances = [];
    //     for (const to in paths) {
    //         const dist = paths[to].distance;
    //         if (dist < Infinity) {
    //             distances.push(dist);
    //         }
    //     }

    //     if (distances.length > 0) {
    //         closeness = roundNumber((nNodes - 1) / sum(distances));
    //     } else {
    //         closeness = 0;
    //     }
    //     return results
    // },
  }
  updateEdgeLabel(from: string, to: string, key: string, newValue: any) {
    const newLabel = this.edge(from, to)
    newLabel[key] = newValue
    this.setEdge(from, to, newLabel)
  }
}
