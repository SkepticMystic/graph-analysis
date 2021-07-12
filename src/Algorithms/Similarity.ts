import type { Graph } from "graphlib";
import type { SimilarityAlg, SimilarityObj } from "src/Interfaces";
import { nodeIntersection } from "src/Utility";

export function JaccardSimilarity(g: Graph, a: string, b: string) {
    const [Na, Nb] = [
        g.neighbors(a) as string[],
        g.neighbors(b) as string[]
    ];
    const Nab = nodeIntersection(Na, Nb).length;
    return (Nab / (Na.length + Nb.length - Nab))
}

export const nodeSimilarity: SimilarityAlg = (g: Graph): SimilarityObj[] => {
    const similarityArr: SimilarityObj[] = [];
    const nodes = g.nodes();
    nodes.forEach(a => {
        nodes.forEach(b => {
            const similarity = JaccardSimilarity(g, a, b)
            similarityArr.push({ a, b, similarity })
        })
    })
    return similarityArr;
}

export const SIMILARITY_TYPES: {
    subtype: string,
    alg: SimilarityAlg
}[] = [
        { subtype: 'Node Similarity', alg: nodeSimilarity }
    ]