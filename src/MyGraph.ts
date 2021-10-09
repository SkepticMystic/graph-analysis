import * as graphlib from "graphlib";
import { Graph } from "graphlib";
import { DECIMALS } from "src/Constants";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { AnalysisAlg, GraphData, ResolvedLinks, Subtypes } from "src/Interfaces";
import { nxnArray, roundNumber, sum } from "src/Utility";
import type { App, HeadingCache, LinkCache } from 'obsidian';
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

    initGraph(): MyGraph {
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

    initData(): void {
        const n = this.nodes().length;
        Object.keys(this.data).forEach((key: Subtypes) => {
            const nxnMatrix: undefined[][] = nxnArray(n);
            this.data[key] = nxnMatrix
        })
    }

    neighTest() {
        return this.neighbors('transactionalism')
    }

    algs: {
        [subtype in Subtypes]: AnalysisAlg
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

            'Co-Citations': async (a: string) : Promise<number[]> => {
                const mdCache = this.app.metadataCache;
                const results: number[] = new Array(this.nodes().length).fill(0)
                const pres = (this.predecessors(a) as string[]);

                for (const preI in pres) {
                    const pre = pres[preI];
                    const file = mdCache.getFirstLinkpathDest(pre, '');
                    const cache = mdCache.getFileCache(file);

                    const bestReference: { [name: string]: number } = {};
                    const ownLinks = cache.links.filter((link) => {
                        let spl = a.split('/');
                        return link.link === spl[spl.length-1];
                    });

                    const cachedRead = await this.app.vault.cachedRead(file);
                    // Find the sentence the link is in
                    const ownSentences = ownLinks.map((link) => {
                       let line = cachedRead[link.position.start.line];
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
                    cache.links.forEach((link) => {
                        if (link.link === a) return;

                        // Check if it is in the same sentence
                        const sameSentenceOwnLink = ownLinks.find((ownLink) =>
                            ownLink.position.start.line === link.position.start.line);
                        if (sameSentenceOwnLink) {
                            bestReference[link.link] = 1;
                            return;
                        }

                        if (!(link.link in bestReference)) {
                            bestReference[link.link] = 0;
                        }

                        // Check if it is in the same paragraph
                        const sameParagraph = ownSections.find((section) =>
                            section.position.start.line <= link.position.start.line &&
                            section.position.end.line >= link.position.end.line);
                        if (sameParagraph) {
                            bestReference[link.link] = Math.max(1 / 2, bestReference[link.link]);
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
                            bestReference[link.link] = Math.max(
                                1 / Math.pow(2, 2 + maxHeadingLevel - bestLevel), bestReference[link.link]);
                            return;
                        }

                        // The links appear together in the same document, but not under a shared heading
                        minHeadingLevel = cache.headings && cache.headings.length > 0 ? minHeadingLevel : 0;
                        maxHeadingLevel = cache.headings && cache.headings.length > 0 ? maxHeadingLevel : 0;
                        // Intuition of weight: The least specific heading will give the weight 2 + maxHeadingLevel - minHeadingLevel
                        // We want to weight it 1 factor less.

                        bestReference[link.link] = Math.max(
                            1 / Math.pow(2, 3 + maxHeadingLevel - minHeadingLevel), bestReference[link.link]);
                    });

                    // Add the found weights to the results
                    for (let key in bestReference) {
                        results[this.node(key)] += bestReference[key];
                    }
                }

                const currI = this.node(a)
                results[currI] = 0
                console.log({results})
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

    async getData(subtype: Subtypes, from: string): Promise<number[]> {
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
