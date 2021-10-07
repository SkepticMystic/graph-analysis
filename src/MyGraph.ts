import * as graphlib from "graphlib";
import { Graph } from "graphlib";
import { DECIMALS } from "src/Constants";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { AnalysisAlg, GraphData, ResolvedLinks, Subtypes } from "src/Interfaces";
import { nxnArray, roundNumber, sum } from "src/Utility";

export default class MyGraph extends Graph {
    resolvedLinks: ResolvedLinks;

    constructor(resolvedLinks: ResolvedLinks) {
        super()
        this.resolvedLinks = resolvedLinks;
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
            "Jaccard": (a: string) => {
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


            'Adamic Adar': (a: string): number[] => {
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

            'Common Neighbours': (a: string): number[] => {
                const Na = this.neighbors(a) as string[]
                const results: number[] = []

                this.nodes().forEach(to => {
                    const Nb = (this.neighbors(to) ?? []) as string[]
                    results.push(nodeIntersection(Na, Nb).length)
                })
                return results
            },

            'Co-Citations': (a: string) => {
                const results: number[] = new Array(this.nodes().length).fill(0)
                const pres = (this.predecessors(a) as string[]);
                pres.forEach(pre => {
                    const succs = (this.successors(pre) as string[])
                    succs.forEach(succ => {

                        
                        const i = this.node(succ)
                        // Get TFile for pre
                        // Get links from cache
                        // Get distance
                        // Duplicate links: Only take high score
                        // Weight the results

                        results[i]++
                        results[i]
                    });
                })
                const currI = this.node(a)
                results[currI] = 0
                console.log({ coResults: results })
                return results
            },

            'testSubtype': (a: string) => new Array(this.nodes().length).fill(1.2)


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

    getData(subtype: Subtypes, from: string): number[] {
        const i = this.node(from)
        if (i === undefined) { return new Array(this.nodes().length) }
        // Check for symmetric measures
        if (this.data[subtype]?.[i]?.[0] !== undefined) {
            return this.data[subtype][i]
        } else {
            this.data[subtype][i] = this.algs[subtype](from)
            return this.data[subtype][i]
        }
    }

    updateEdgeLabel(from: string, to: string, key: string, newValue: any) {
        const newLabel = this.edge(from, to);
        newLabel[key] = newValue;
        this.setEdge(from, to, newLabel);
    }
}
