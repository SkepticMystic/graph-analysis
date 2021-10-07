import type { Graph } from "graphlib";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { AnalysisForAll, AnalysisObj, SimilarityAlg } from "src/Interfaces";
import type MyGraph from "src/MyGraph";
import { roundNumber } from "src/Utility";

export const JaccardSimilarity: SimilarityAlg = (g: Graph, a: string, b: string) => {
    const [Na, Nb] = [
        g.neighbors(a) as string[],
        g.neighbors(b) as string[]
    ];
    const Nab = nodeIntersection(Na, Nb);
    return (Nab.length / (Na.length + Nb.length - Nab.length))
}

export const similarityForAll: AnalysisForAll = (
    alg: SimilarityAlg,
    g: MyGraph,
    currNode: string) => {

    const similarityArr: AnalysisObj[] = [];
    const nodes = g.nodes();
    nodes.forEach(node => {
        const similarity = roundNumber(alg(g, node, currNode));
        similarityArr.push({
            from: currNode,
            to: node,
            measure: similarity,
            linked: g.hasEdge(currNode, node)
        })
    })
    return similarityArr;
}

export const SIMILARITY_TYPES: {
    subtype: string
}[] = [
        { subtype: 'Jaccard Similarity'},
        { subtype: 'Co-Citations'},
    ]