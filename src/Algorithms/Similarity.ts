import type { Graph } from "graphlib";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { SimilarityAlg, SimilarityObj } from "src/Interfaces";
import { roundNumber } from "src/Utility";

export function JaccardSimilarity(g: Graph, a: string, b: string) {
    const [Na, Nb] = [
        g.neighbors(a) as string[],
        g.neighbors(b) as string[]
    ];
    const Nab = nodeIntersection(Na, Nb);
    return (Nab.length / (Na.length + Nb.length - Nab.length))
}

export const nodeSimilarity: SimilarityAlg = (g: Graph, currNode: string): SimilarityObj[] => {
    const similarityArr: SimilarityObj[] = [];
    const nodes = g.nodes();
    nodes.forEach(a => {
        const similarity = roundNumber(JaccardSimilarity(g, a, currNode))
        similarityArr.push({ a, b: currNode, similarity })
    })
    return similarityArr;
}

export const SIMILARITY_TYPES: {
    subtype: string,
    alg: SimilarityAlg
}[] = [
        { subtype: 'Node Similarity', alg: nodeSimilarity }
    ]