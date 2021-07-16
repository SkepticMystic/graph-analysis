import * as graphlib from "graphlib";
import { Graph } from "graphlib";
import { adamicAdarLinkPrediction, commonNeighboursLinkPrediction } from "src/Algorithms/LinkPrediction";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { AnalysisAlg, GraphData, ResolvedLinks, Subtypes } from "src/Interfaces";
import { nxnArray, roundNumber, sum } from "src/Utility";

export default class MyGraph extends Graph {
    resolvedLinks: ResolvedLinks;

    constructor(resolvedLinks: ResolvedLinks) {
        super()
        this.resolvedLinks = resolvedLinks;
    }

    initGraph(): Graph {
        let i = 0;
        for (const source in this.resolvedLinks) {
            const sourceNoMD = source.split('.md', 1)[0]
            this.setNode(sourceNoMD, i);
            i++;
            for (const dest in this.resolvedLinks[source]) {
                const destNoMD = dest.split('.md')[0]
                this.setEdge(sourceNoMD, destNoMD);
            }
        }
        return this
    }


    data: GraphData = {
        'Adamic Adar': [],
        'Common Neighbours': [],
        'Jaccard': [],
        'Closeness': []
    };

    initData(): void {
        const n = this.nodes().length;
        const nxnMatrix: undefined[][] = nxnArray(n);
        Object.keys(this.data).forEach((key: Subtypes) => {
            this.data[key] = nxnMatrix
        })
    }

    algs: {
        [subtype in Subtypes]: AnalysisAlg
    } = {
            "Jaccard": (a: string, b: string) => {
                const [Na, Nb] = [
                    this.neighbors(a) as string[],
                    this.neighbors(b) as string[]
                ];
                const Nab = nodeIntersection(Na, Nb);
                const jaccard = (Nab.length / (Na.length + Nb.length - Nab.length));

                this.updateData("Jaccard", jaccard, a, b)
                return jaccard
            },


            'Adamic Adar': (a: string, b: string): number => {
                const [Na, Nb] = [
                    this.neighbors(a) as string[],
                    this.neighbors(b) as string[]
                ];
                const Nab = nodeIntersection(Na, Nb);

                let adamicAdar;
                if (Nab.length) {
                    const neighbours: number[] = Nab.map(node => (this.successors(node) as string[]).length)
                    adamicAdar = roundNumber(sum(
                        neighbours.map(neighbour => 1 / Math.log(neighbour))
                    ))
                } else {
                    adamicAdar = Infinity
                }

                this.updateData('Adamic Adar', adamicAdar, a, b);
                return adamicAdar
            },

            'Common Neighbours': (a: string, b: string): number => {
                const [Na, Nb] = [
                    this.neighbors(a) as string[],
                    this.neighbors(b) as string[]
                ];
                const noNab = nodeIntersection(Na, Nb).length

                this.updateData('Common Neighbours', noNab, a, b)
                return noNab
            },


            'Closeness': (a: string) => {
                const paths = graphlib.alg.dijkstra(this, a);

                const distances = [];
                for (const target in paths) {
                    const dist = paths[target].distance;
                    if (dist < Infinity) {
                        distances.push(dist);
                    }
                }

                let closeness;
                if (distances.length > 0) {
                    closeness = roundNumber((this.nodes().length - 1) / sum(distances));
                } else {
                    closeness = 0;
                }
                // Closeness is 1d, so only fill in one row, with the column `a`
                this.updateData('Closeness', closeness, 1, a)
                return closeness
            },
        }

    updateData(subtype: Subtypes, value: number, from: string | number, to: string | number) {
        let i;
        let j;
        if (typeof from === 'string') {
            i = this.node(from)
        } else {
            i = from
        }
        if (typeof to === 'string') {
            j = this.node(to)
        } else {
            j = to
        }
        console.log({ i, j })
        if (this.data[subtype][i][j]) { return this.data }
        this.data[subtype][i][j] = value;
        return this.data
    }

    getData(subtype: Subtypes, from: string | number, to: string | number): number | undefined {
        let i;
        let j;
        if (typeof from === 'string') {
            i = this.node(from)
        } else {
            i = from
        }
        if (typeof to === 'string') {
            j = this.node(to)
        } else {
            j = to
        }

        return this.data[subtype][i][j]
    }

    updateEdgeLabel(from: string, to: string, key: string, newValue: any) {
        const newLabel = this.edge(from, to);
        newLabel[key] = newValue;
        this.setEdge(from, to, newLabel);
    }
}
