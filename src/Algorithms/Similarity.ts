import type { Graph } from "graphlib";
import { nodeIntersection, sum } from "src/Utility";
import type { Similarity } from "src/Interfaces";

export function adamicAdarSimilarity(g: Graph, node1: string, node2: string): number {
    const [neighbours1, neighbours2] = [g.neighbors(node1) as string[], g.neighbors(node2) as string[]];
    const commonNodes = nodeIntersection(neighbours1, neighbours2);
    // console.log(commonNodes)

    if (commonNodes.length) {
        const neighbours: number[] = commonNodes.map(node => (g.successors(node) as string[]).length)
        return sum(neighbours.map(neighbour => 1 / Math.log(neighbour)))
    } else {
        return 0
    }
}

export function similaritiesForAll(
    type: (g: Graph, node1: string, node2: string) => number,
    g: Graph): Similarity[] {
    const similarities: Similarity[] = []
    const paths = g.nodes();

    for (let i = 0; i < paths.length; i++) {
        for (let j = 0; j < i; j++) {
            const node1 = paths[i];
            const node2 = paths[j];

            const similarity = type(g, node1, node2)
            similarities[i] = { node1, node2, similarity }
        }
    }
    return similarities
}