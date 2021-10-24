import { Graph } from "graphlib";
import { DECIMALS } from "src/Constants";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { AnalysisAlg, CoCitation, CoCitationRes, GraphData, ResolvedLinks, Subtypes } from 'src/Interfaces'
import { nxnArray, roundNumber, sum } from "src/Utility";
import type { App, HeadingCache, LinkCache, ReferenceCache } from 'obsidian'
import tokenizer from 'sbd';


export default class MyGraph extends Graph {
    resolvedLinks: ResolvedLinks;
    app: App;

    constructor(resolvedLinks: ResolvedLinks, app: App) {
        super()
        this.resolvedLinks = resolvedLinks;
        this.app = app;
    }

    nodeMapping: { [name: string]: number } = {}

    async initGraph(): Promise<MyGraph> {
        let i = 0;
        for (const source in this.resolvedLinks) {
            if (source.split('.').last() === 'md') {
                const sourceNoMD = source.split('.md', 1)[0]
                this.setNode(sourceNoMD, i);

                i++;
                for (const dest in this.resolvedLinks[source]) {
                    if (dest.split('.').last() === 'md') {
                        const destNoMD = dest.split('.md')[0]
                        this.setEdge(sourceNoMD, destNoMD);
                    }
                }
            }
        }
        return this
    }

    // Separate caches for each measure
    data: GraphData = {
        'Adamic Adar': [],
        'Common Neighbours': [],
        'Jaccard': [],
        'testSubtype': [],
        'Co-Citations': [],
        // 'Closeness': []
    };

    async initData(): Promise<void> {
        const n = this.nodes().length;
        Object.keys(this.data).forEach((key: Subtypes) => {
            this.data[key] = nxnArray(n);
        })
    }

    neighTest() {
        return this.neighbors('transactionalism')
    }

    algs: {
        [subtype in Subtypes]: AnalysisAlg<number[]> | AnalysisAlg<CoCitationRes[]>
    } = {
            "Jaccard": async (a: string): Promise<number[]> => {
                const Na = this.neighbors(a) as string[]
                const results: number[] = []

                this.nodes().forEach(to => {
                    const Nb = (this.neighbors(to) as string[]) ?? []
                    const Nab = nodeIntersection(Na, Nb);
                    results.push(
                        roundNumber(
                            Nab.length / (Na.length + Nb.length - Nab.length)
                            , DECIMALS)
                    );

                })
                return results
            },


            'Adamic Adar': async (a: string): Promise<number[]> => {
                const Na = this.neighbors(a) as string[]
                const results: number[] = []

                this.nodes().forEach(to => {
                    const Nb = this.neighbors(to) as string[]
                    const Nab = nodeIntersection(Na, Nb);

                    if (Nab.length) {
                        const neighbours: number[] = Nab.map(node => (this.successors(node) as string[]).length)
                        results.push(
                            roundNumber(sum(
                                neighbours.map(neighbour => 1 / Math.log(neighbour))
                            )))
                    } else {
                        results.push(Infinity)
                    }
                })
                return results
            },

            'Common Neighbours': async (a: string): Promise<number[]> => {
                const Na = this.neighbors(a) as string[]
                const results: number[] = []

                this.nodes().forEach(to => {
                    const Nb = (this.neighbors(to) ?? []) as string[]
                    results.push(nodeIntersection(Na, Nb).length)
                })
                // return new Promise<number[]>(results);
              return results;
            },

            'Co-Citations': async (a: string) : Promise<CoCitationRes[]> => {
                const mdCache = this.app.metadataCache;
                const results: CoCitationRes[] = new Array<CoCitationRes>(this.nodes().length)
                for (let i = 0; i < this.nodes().length; i++) {
                    results[i] = {measure: 0, coCitations: []};
                }
                const pres = (this.predecessors(a) as string[]);

                for (const preI in pres) {
                    const pre = pres[preI];
                    const file = mdCache.getFirstLinkpathDest(pre, '');
                    const cache = mdCache.getFileCache(file);

                    const preCocitations: { [name: string]: [number, CoCitation[]]} = {};
                    let spl = a.split('/');
                    let ownBasename = spl[spl.length-1]
                    const ownLinks = cache.links.filter((link) => {
                        return link.link === ownBasename;
                    });

                    const cachedRead = await this.app.vault.cachedRead(file);
                    const content = cachedRead.split('\n');
                    // Find the sentence the link is in
                    const ownSentences: [number, number, number, ReferenceCache][] = ownLinks.map((link) => {
                       let line = content[link.position.end.line];
                       const sentences = tokenizer.sentences(line, {preserve_whitespace: true});
                       let aggrSentenceLength = 0;
                       let res: [number, number, number, ReferenceCache] = null;
                       sentences.forEach((sentence:string) => {
                           if (res) return;
                           aggrSentenceLength += sentence.length;
                           // Edge case that does not work: If alias has end of sentences.
                           if (link.position.end.col <= aggrSentenceLength) {
                               res = [link.position.end.line, aggrSentenceLength - sentence.length, aggrSentenceLength, link];
                           }
                       });
                       return res;
                    });

                    // Find the section the link is in
                    const ownSections = ownLinks.map((link) =>
                        cache.sections.find((section) =>
                            section.position.start.line <= link.position.start.line &&
                            section.position.end.line >= link.position.end.line)
                    )

                    // Find the headings the link is under
                    let minHeadingLevel = 7;
                    let maxHeadingLevel = 0;
                    const ownHeadings: [HeadingCache, number][] = [];
                    ownLinks.forEach((link) => {
                        if (!cache.headings) return;
                        cache.headings.forEach((heading, index) => {
                            minHeadingLevel = Math.min(minHeadingLevel, heading.level);
                            maxHeadingLevel = Math.max(maxHeadingLevel, heading.level);
                            // The link falls under this header!
                            if (heading.position.start.line <= link.position.start.line) {
                                for (const j of Array(cache.headings.length - index - 1).keys()) {
                                    let nextHeading = cache.headings[j + index + 1];
                                    // Scan for the next header with at least as low of a level
                                    if (nextHeading.level >= heading.level) {
                                        if (nextHeading.position.start.line <= link.position.start.line) return
                                        ownHeadings.push([heading, nextHeading.position.start.line]);
                                        return;
                                    }
                                }
                                // No more headers after this one. Use arbitrarily number for length to keep things simple...
                                ownHeadings.push([heading, 100000000000]);
                            }
                        })
                    }
                    )
                    minHeadingLevel = cache.headings && cache.headings.length > 0 ? minHeadingLevel : 0;
                    maxHeadingLevel = cache.headings && cache.headings.length > 0 ? maxHeadingLevel : 0;

                    cache.links.forEach((link) => {
                        if (link.link === ownBasename) return;

                        // Initialize to 0 if not set yet
                        if (!(link.link in preCocitations)) {
                            preCocitations[link.link] = [0, []];
                        }

                        const lineContent = content[link.position.start.line];
                        // Check if the link is on the same line
                        let hasOwnLine = false;
                        ownSentences.forEach(([line, start, end, ownLink]) => {
                            if (link.position.start.line === line) {
                                const m1Start = Math.min(link.position.start.col, ownLink.position.start.col);
                                const m1End = Math.min(link.position.end.col, ownLink.position.end.col);
                                const m2Start = Math.max(link.position.start.col, ownLink.position.start.col);
                                const m2End = Math.max(link.position.end.col, ownLink.position.end.col);
                                // Give a higher score if it is also in the same sentence
                                if (link.position.start.col >= start && link.position.end.col <= end) {
                                    const sentenceS = lineContent.slice(start, end);
                                    const sentence = [sentenceS.slice(0, m1Start),
                                                      sentenceS.slice(m1Start, m1End),
                                                      sentenceS.slice(m1End, m2Start),
                                                      sentenceS.slice(m2Start, m2End),
                                                      sentenceS.slice(m2End, sentenceS.length)];
                                    preCocitations[link.link][0] = 1;
                                    preCocitations[link.link][1].push({sentence: sentence, measure: 1,
                                        source: pre, line: link.position.start.line})
                                }

                                else {
                                    const sentence = [lineContent.slice(0, m1Start),
                                        lineContent.slice(m1Start, m1End),
                                        lineContent.slice(m1End, m2Start),
                                        lineContent.slice(m2Start, m2End),
                                        lineContent.slice(m2End, lineContent.length)];
                                    preCocitations[link.link][0] = Math.max(preCocitations[link.link][0], 1/2);
                                    preCocitations[link.link][1].push({sentence: sentence, measure: 1/2,
                                        source: pre, line: link.position.start.line});
                                }
                                hasOwnLine = true;
                            }
                        });
                        if (hasOwnLine) return;

                        const sentence = [lineContent.slice(0, link.position.start.col),
                                          lineContent.slice(link.position.start.col, link.position.end.col),
                                          lineContent.slice(link.position.end.col, lineContent.length)];

                        // Check if it is in the same paragraph
                        const sameParagraph = ownSections.find((section) =>
                            section.position.start.line <= link.position.start.line &&
                            section.position.end.line >= link.position.end.line);
                        if (sameParagraph) {
                            preCocitations[link.link][0] = Math.max(preCocitations[link.link][0], 1/4);
                            preCocitations[link.link][1].push({sentence: sentence, measure: 1/4,
                                source: pre, line: link.position.start.line});
                            return;
                        }

                        // Find the best corresponding heading
                        const headingMatches = ownHeadings.filter(([heading, end]) =>
                            heading.position.start.line <= link.position.start.line &&
                            end > link.position.end.line);
                        if (headingMatches.length > 0) {
                            const bestLevel = Math.max(...headingMatches.map(([heading, _]) => heading.level));
                            // Intuition: If they are both under the same 'highest'-level heading, they get weight 1/4
                            // Then, maxHeadingLevel - bestLevel = 0, so we get 1/(2^2)=1/4. If the link appears only under
                            // less specific headings, the weight will decrease.
                            const score = 1 / Math.pow(2, 3 + maxHeadingLevel - bestLevel);
                            preCocitations[link.link][0] = Math.max(preCocitations[link.link][0], score);
                            preCocitations[link.link][1].push({measure: score, sentence: sentence,
                                source: pre, line: link.position.start.line});
                            return;
                        }

                        // The links appear together in the same document, but not under a shared heading
                        // Intuition of weight: The least specific heading will give the weight 2 + maxHeadingLevel - minHeadingLevel
                        // We want to weight it 1 factor less.
                        const score = 1 / Math.pow(2, 4 + maxHeadingLevel - minHeadingLevel);
                        preCocitations[link.link][0] = Math.max(preCocitations[link.link][0], score);
                        preCocitations[link.link][1].push({measure: score, sentence: sentence,
                            source: pre, line: link.position.start.line});
                    });

                    // Add the found weights to the results
                    for (let key in preCocitations) {
                        const file = mdCache.getFirstLinkpathDest(key, '');
                        if (file) {
                            const ccRes = results[this.node(file.path.slice(0, file.path.length-3))];
                            if (ccRes) {
                                ccRes.measure += preCocitations[key][0];
                                ccRes.coCitations.push(...preCocitations[key][1]);
                            }
                        }
                    }
                }

                const currI = this.node(a)
                results[currI] = {measure: 0, coCitations: []};
                for (const key in results) {
                    if (results[key].coCitations.length > 0) {
                        results[key].coCitations = results[key].coCitations.sort((a, b) =>
                          a.measure > b.measure ? -1 : 1);
                    }
                }
                return results
            },

            'testSubtype': async (a: string) => new Array(this.nodes().length).fill(1.2)


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

    async getData(subtype: Subtypes, from: string): Promise<number[] | CoCitationRes[]> {
        console.log({ subtype, from });
        const i = this.node(from)
        if (i === undefined) { return new Array(this.nodes().length) }
        // Check for symmetric measures
        if (this.data[subtype]?.[i]?.[0] !== undefined) {
            return this.data[subtype][i]
        } else {
            this.data[subtype][i] = await this.algs[subtype](from)
            return this.data[subtype][i]
        }
    }

    updateEdgeLabel(from: string, to: string, key: string, newValue: any) {
        const newLabel = this.edge(from, to);
        newLabel[key] = newValue;
        this.setEdge(from, to, newLabel);
    }
}
