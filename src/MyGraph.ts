import { Graph } from 'graphlib'
import type { App, HeadingCache, ReferenceCache } from 'obsidian'
import { getLinkpath } from 'obsidian'
import tokenizer from 'sbd'
import { DECIMALS } from 'src/constants'
import { intersection } from 'src/GeneralGraphFn'
import type {
  AnalysisAlg,
  CoCitation,
  CoCitationMap,
  Communities,
  ResolvedLinks,
  ResultMap,
  Subtype,
} from 'src/Interfaces'
import { dropMD, getCounts, getMaxKey, roundNumber, sum } from 'src/Utility'

export default class MyGraph extends Graph {
  resolvedLinks: ResolvedLinks
  app: App

  constructor(resolvedLinks: ResolvedLinks, app: App) {
    super()
    this.resolvedLinks = resolvedLinks
    this.app = app
  }

  nodeMapping: { [name: string]: number } = {}

  async initGraph(): Promise<MyGraph> {
    let i = 0
    for (const source in this.resolvedLinks) {
      if (source.split('.').last() === 'md') {
        const sourceNoMD = dropMD(source)
        this.setNode(sourceNoMD, i)

        i++
        for (const dest in this.resolvedLinks[source]) {
          if (dest.split('.').last() === 'md') {
            const destNoMD = dropMD(dest)
            this.setEdge(sourceNoMD, destNoMD)
          }
        }
      }
    }
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
        let measure = Infinity
        if (denom != 0) measure = roundNumber(Nab.length / denom, DECIMALS)

        results[to] = { measure, extra: Nab }
      })
      return results
    },

    'Adamic Adar': async (a: string): Promise<ResultMap> => {
      const Na = this.neighbors(a) as string[]
      const results: ResultMap = {}

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
        if (!file) {
          continue
        }
        const cache = mdCache.getFileCache(file)

        const preCocitations: { [name: string]: [number, CoCitation[]] } = {}
        let spl = a.split('/')
        let ownBasename = spl[spl.length - 1]
        const allLinks = [...cache.links]
        if (cache.embeds) {
          allLinks.push(...cache.embeds)
        }
        const ownLinks = allLinks.filter((link) => {
          const linkFile = mdCache.getFirstLinkpathDest(
            getLinkpath(link.link),
            file.path
          )
          if (!linkFile) {
            return false
          }
          return (
            linkFile.basename === ownBasename && linkFile.extension === 'md'
          )
        })

        const cachedRead = await this.app.vault.cachedRead(file)
        const content = cachedRead.split('\n')
        // Find the sentence the link is in
        const ownSentences: [number, number, number, ReferenceCache][] =
          ownLinks.map((link) => {
            let line = content[link.position.end.line]
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

        allLinks.forEach((link) => {
          const linkFile = mdCache.getFirstLinkpathDest(
            getLinkpath(link.link),
            file.path
          )
          if (!linkFile || linkFile.extension !== 'md') return

          const linkPath = linkFile.basename
          if (linkPath === ownBasename) return

          // Initialize to 0 if not set yet
          if (!(linkPath in preCocitations)) {
            preCocitations[linkPath] = [0, []]
          }

          const lineContent = content[link.position.start.line]
          // Check if the link is on the same line
          let hasOwnLine = false
          ownSentences.forEach(([line, start, end, ownLink]) => {
            if (link.position.start.line === line) {
              const m1Start = Math.min(
                link.position.start.col,
                ownLink.position.start.col
              )
              const m1End = Math.min(
                link.position.end.col,
                ownLink.position.end.col
              )
              const m2Start = Math.max(
                link.position.start.col,
                ownLink.position.start.col
              )
              const m2End = Math.max(
                link.position.end.col,
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
                link.position.start.col >= start &&
                link.position.end.col <= end
              ) {
                // If it's in the same sentence, remove the other sentences
                sentence[0] = sentence[0].slice(start, sentence[0].length)
                sentence[4] = lineContent.slice(m2End, end)
                preCocitations[linkPath][0] = 1
                preCocitations[linkPath][1].push({
                  sentence: sentence,
                  measure: 1,
                  source: pre,
                  line: link.position.start.line,
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
                  line: link.position.start.line,
                })
              }
              hasOwnLine = true
            }
          })
          if (hasOwnLine) return

          const sentence = [
            lineContent.slice(0, link.position.start.col),
            lineContent.slice(link.position.start.col, link.position.end.col),
            lineContent.slice(link.position.end.col, lineContent.length),
          ]

          // Check if it is in the same paragraph
          const sameParagraph = ownSections.find(
            (section) =>
              section.position.start.line <= link.position.start.line &&
              section.position.end.line >= link.position.end.line
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
              line: link.position.start.line,
            })
            return
          }

          // Find the best corresponding heading
          const headingMatches = ownHeadings.filter(
            ([heading, end]) =>
              heading.position.start.line <= link.position.start.line &&
              end > link.position.end.line
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
              line: link.position.start.line,
            })
            return
          }

          // The links appear together in the same document, but not under a shared heading
          // Intuition of weight: The least specific heading will give the weight 2 + maxHeadingLevel - minHeadingLevel
          // We want to weight it 1 factor less.
          const score = 1 / Math.pow(2, 4 + maxHeadingLevel - minHeadingLevel)
          preCocitations[linkPath][0] = Math.max(
            preCocitations[linkPath][0],
            score
          )
          preCocitations[linkPath][1].push({
            measure: score,
            sentence: sentence,
            source: pre,
            line: link.position.start.line,
          })
        })

        // Add the found weights to the results
        for (let key in preCocitations) {
          const file = mdCache.getFirstLinkpathDest(key, '')
          if (file) {
            let linkName = file.path.slice(0, file.path.length - 3)
            let cocitation = preCocitations[key]
            if (linkName in results) {
              results[linkName].measure += cocitation[0]
              results[linkName].coCitations.push(...cocitation[1])
            } else {
              results[linkName] = {
                measure: cocitation[0],
                coCitations: cocitation[1],
              }
            }
          }
        }
      }

      results[a] = { measure: 0, coCitations: [] }
      for (const key in results) {
        results[key].coCitations = results[key].coCitations.sort((a, b) =>
          a.measure > b.measure ? -1 : 1
        )
      }
      return results
    },

    'Label Propagation': async (a: string): Promise<Communities> => {
      console.log('running')
      const labeledNodes: { [node: string]: number } = {}
      this.nodes().forEach((node, i) => {
        labeledNodes[node] = i
      })

      for (let i = 0; i < 30; i++) {
        this.nodes().forEach((node) => {
          const neighbours = this.neighbors(node) as string[]

          if (neighbours.length) {
            const neighbourLabels = neighbours.map(
              (neighbour) => labeledNodes[neighbour]
            )
            const counts = getCounts(neighbourLabels)
            const maxKey = getMaxKey(counts)

            neighbours.forEach(
              (neighbour) => (labeledNodes[neighbour] = Number.parseInt(maxKey))
            )
          }
        })
      }
      const communities: Communities = {}
      Object.entries(labeledNodes).forEach((labeledNode: [string, number]) => {
        const [node, label] = labeledNode
        if (communities[label] === undefined) {
          communities[label] = [node]
        } else {
          communities[label].push(node)
        }
      })
      console.log('ended')
      return communities
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

  // async getData(
  //   subtype: Subtype,
  //   from: string
  // ): Promise<ResultMap | CoCitationMap> {
  //   const i = this.node(from)
  //   if (i === undefined) {
  //     return new Array(this.nodes().length)
  //   }
  //   // Check for symmetric measures
  //   // TODO: Adapt this for co-citations
  //   if (subtype !== 'Co-Citations') {
  //     if ((this.data[subtype]?.[i] as number[])?.[0] !== undefined) {
  //       return this.data[subtype][i]
  //     } else {
  //       this.data[subtype][i] = await this.algs[subtype](from)
  //       return this.data[subtype][i]
  //     }
  //   }
  //   return this.algs[subtype](from)
  // }

  updateEdgeLabel(from: string, to: string, key: string, newValue: any) {
    const newLabel = this.edge(from, to)
    newLabel[key] = newValue
    this.setEdge(from, to, newLabel)
  }
}
