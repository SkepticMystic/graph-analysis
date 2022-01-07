import Graph from 'graphology'
import louvain from 'graphology-communities-louvain'
import hits from 'graphology-metrics/centrality/hits'

import {
  App,
  CacheItem,
  HeadingCache,
  Notice,
  ReferenceCache,
  TagCache,
} from 'obsidian'
import { getAllTags, getLinkpath } from 'obsidian'
import tokenizer from 'sbd'
import {
  clusteringCoefficient,
  gatherCommunities,
  intersection,
} from 'src/GeneralGraphFn'
import type {
  AnalysisAlg,
  CoCitation,
  CoCitationMap, CoCitationRes,
  Communities,
  GraphAnalysisSettings,
  HITSResult,
  NLPPlugin,
  ResultMap,
  Subtype,
} from 'src/Interfaces'
import { getCounts, getMaxKey, roundNumber, sum } from 'src/Utility'
import * as similarity from 'wink-nlp/utilities/similarity'

export default class MyGraph extends Graph {
  app: App
  settings: GraphAnalysisSettings

  constructor(app: App, settings: GraphAnalysisSettings) {
    super()
    this.app = app
    this.settings = settings
  }

  async initGraph(): Promise<MyGraph> {
    const { resolvedLinks, unresolvedLinks } = this.app.metadataCache
    const { exclusionRegex, exclusionTags, allFileExtensions, addUnresolved } =
      this.settings
    const regex = new RegExp(exclusionRegex, 'i')
    let i = 0

    const includeTag = (tags: TagCache[] | undefined) =>
      exclusionTags.length === 0 ||
      !tags ||
      tags.findIndex((t) => exclusionTags.includes(t.tag)) === -1
    const includeRegex = (node: string) =>
      exclusionRegex === '' || !regex.test(node)
    const includeExt = (node: string) =>
      allFileExtensions || node.endsWith('md')

    for (const source in resolvedLinks) {
      const tags = this.app.metadataCache.getCache(source)?.tags
      if (includeTag(tags) && includeRegex(source) && includeExt(source)) {
        if (!this.hasNode(source)) {
          this.addNode(source, { i })
          i++
        }

        for (const dest in resolvedLinks[source]) {
          const tags = this.app.metadataCache.getCache(dest)?.tags
          if (includeTag(tags) && includeRegex(dest) && includeExt(dest)) {
            if (!this.hasNode(dest)) {
              this.addNode(dest, { i })
              i++
            }
            this.addEdge(source, dest, { resolved: true })
          }
        }
      }
    }

    if (addUnresolved) {
      for (const source in unresolvedLinks) {
        if (includeRegex(source)) {
          if (!this.hasNode(source)) {
            this.addNode(source, { i })
            i++
          }

          for (const dest in unresolvedLinks[source]) {
            const destMD = dest + '.md'
            if (includeRegex(destMD)) {
              if (!this.hasNode(destMD)) {
                this.addNode(destMD, { i })
                i++
              }
              this.addEdge(source, destMD, { resolved: false })
            }
          }
        }
      }
    }
    return this
  }

  algs: {
    [subtype in Subtype]: AnalysisAlg<
      ResultMap | CoCitationMap | Communities | string[] | HITSResult
    >
  } = {
    Jaccard: async (a: string): Promise<ResultMap> => {
      const Na = this.neighbors(a)
      const results: ResultMap = {}
      this.forEachNode((to) => {
        const Nb = this.neighbors(to)
        const Nab = intersection(Na, Nb)
        const denom = Na.length + Nb.length - Nab.length
        let measure = denom !== 0 ? roundNumber(Nab.length / denom) : Infinity

        results[to] = { measure, extra: Nab }
      })
      return results
    },

    HITS: async (a: string) => {
      return hits(this)
    },

    Overlap: async (a: string): Promise<ResultMap> => {
      const results: ResultMap = {}
      const Na = this.neighbors(a)
      this.forEachNode((to) => {
        const Nb = this.neighbors(to)
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
      const results: ResultMap = {}
      const Na = this.neighbors(a)

      this.forEachNode((to) => {
        const Nb = this.neighbors(to)
        const Nab = intersection(Na, Nb)
        let measure = Infinity
        if (Nab.length) {
          const neighbours: number[] = Nab.map(
            (n) => this.outNeighbors(n).length
          )
          measure = roundNumber(
            sum(neighbours.map((neighbour) => 1 / Math.log(neighbour)))
          )
        }
        results[to] = { measure, extra: Nab }
      })
      return results
    },

    // 'Common Neighbours': async (a: string): Promise<ResultMap> => {
    //   const Na = this.neighbors(a)
    //   const results: ResultMap = {}

    //   this.forEachNode((to) => {
    //     const Nb = this.neighbors(to)
    //     const Nab = intersection(Na, Nb)
    //     const measure = Nab.length
    //     results[to] = { measure, extra: Nab }
    //   })
    //   return results
    // },

    'Co-Citations': async (a: string): Promise<CoCitationMap> => {
      const mdCache = this.app.metadataCache
      const results = {} as CoCitationMap
      const { settings } = this

      // const pres = this.inNeighbors(a)
      // for (const preI in pres) {
      //   const pre = pres[preI]
      this.forEachInNeighbor(a, async (pre) => {
        const file = mdCache.getFirstLinkpathDest(pre, '')
        if (!file) return

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
            settings.allFileExtensions || linkFile.extension === 'md'
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
        if (cache.tags && settings.coTags) {
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
            else if (
              !settings.allFileExtensions &&
              linkFile.extension !== 'md'
            ) {
              return
            } else {
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

        if (settings.coTags) {
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
          } else if (key[0] === '#') {
            name = key
          } else if (settings.addUnresolved) {
            name = key + '.md'
            resolved = false
          } else {
            continue
          }
          let cocitation = preCocitations[key]
          if (name in results) {
            results[name].measure += cocitation[0]
            results[name].coCitations.push(...cocitation[1])
          } else {
            results[name] = {
              measure: cocitation[0],
              coCitations: cocitation[1],
              resolved
            };
          }
        }
      })
      results[a] = { measure: 0, coCitations: [], resolved: true };

      return results
    },

    'Label Propagation': async (
      a: string,
      options: { iterations: number }
    ): Promise<Communities> => {
      let labeledNodes: { [node: string]: string } = {}
      this.forEachNode((node) => {
        labeledNodes[node] = node
      })

      for (let i = 0; i < options.iterations; i++) {
        const newLabeledNodes: { [node: string]: string } = {}
        this.forEachNode((node) => {
          const neighbours = this.neighbors(node)
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
      return gatherCommunities(labeledNodes)
    },

    Louvain: async (
      a: string,
      options: { resolution: number } = { resolution: 10 }
    ): Promise<string[]> => {
      const labelledNodes = louvain(this, options)
      const labelOfA = labelledNodes[a]
      const currComm: string[] = []
      this.forEachNode((node) => {
        if (labelledNodes[node] === labelOfA) {
          currComm.push(node)
        }
      })
      return currComm
    },

    'Clustering Coefficient': async (a: string): Promise<ResultMap> => {
      const results: ResultMap = {}

      this.forEachNode((to: string) => {
        const { coeff, triangles } = clusteringCoefficient(this, to)
        results[to] = {
          measure: roundNumber(coeff),
          extra: triangles.map((group) => group.join(', ')),
        }
      })
      return results
    },

    BoW: async (a: string): Promise<ResultMap> => {
      const results: ResultMap = {}
      const nlp = getNLPPlugin(this.app)
      if (!nlp) return results

      const { Docs } = nlp
      const sourceBoW = nlp.getNoStopBoW(Docs[a])

      this.forEachNode(async (to: string) => {
        const targetDoc = Docs[to]
        if (!targetDoc) {
          results[to] = { measure: 0, extra: [] }
        }
        const targetBoW = nlp.getNoStopBoW(Docs[to])

        const measure = similarity.bow.cosine(sourceBoW, targetBoW)
        results[to] = {
          measure,
          extra: [],
        }
      })
      return results
    },

    // Tversky: async (a: string): Promise<ResultMap> => {
    //   const results: ResultMap = {}
    //   const nlp = getNLPPlugin(this.app)
    //   if (!nlp) return results

    //   const { Docs } = nlp
    //   const sourceSet = nlp.getNoStopSet(Docs[a])

    //   this.forEachNode(async (to: string) => {
    //     const targetDoc = Docs[to]
    //     if (!targetDoc) {
    //       results[to] = { measure: 0, extra: [] }
    //     }
    //     const targetSet = nlp.getNoStopSet(Docs[to])

    //     const measure = similarity.set.tversky(sourceSet, targetSet)
    //     results[to] = {
    //       measure,
    //       extra: [],
    //     }
    //   })
    //   return results
    // },

    'Otsuka-Chiai': async (a: string): Promise<ResultMap> => {
      const results: ResultMap = {}
      const nlp = getNLPPlugin(this.app)
      if (!nlp) return results

      const { Docs } = nlp
      const sourceSet = nlp.getNoStopSet(Docs[a])

      this.forEachNode(async (to: string) => {
        const targetDoc = Docs[to]
        if (!targetDoc) {
          results[to] = { measure: 0, extra: [] }
        }
        const targetSet = nlp.getNoStopSet(Docs[to])

        const measure = similarity.set.oo(sourceSet, targetSet)
        results[to] = {
          measure,
          extra: [],
        }
      })
      return results
    },

    Sentiment: async (a: string): Promise<ResultMap> => {
      const results: ResultMap = {}
      const nlp = getNLPPlugin(this.app)
      if (!nlp) return results

      const { Docs } = nlp
      this.forEachNode((node) => {
        const doc = Docs[node]
        if (!doc) {
          results[node] = { measure: 0, extra: [] }
          return
        }
        const measure = nlp.getAvgSentimentFromDoc(doc)
        results[node] = { measure, extra: [] }
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
}

function getNLPPlugin(app: App): NLPPlugin | null {
  const { nlp } = app.plugins.plugins
  if (!nlp) {
    new Notice(
      'The NLP plugin must be installed & enabled to use the 💬 algorithms.'
    )
    return null
  } else if (!nlp?.settings?.refreshDocsOnLoad) {
    new Notice('In the NLP plugin, enable the setting "Refresh Docs on load".')
    return null
  } else return nlp
}
