import type { Graph } from "graphlib";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { AnalysisForAll, AnalysisObj, ResolvedLinks, SimilarityAlg } from "src/Interfaces";
import { linkedQ, roundNumber } from "src/Utility";

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
    g: Graph,
    currNode: string,
    resolvedLinks: ResolvedLinks) => {

    const similarityArr: AnalysisObj[] = [];
    const nodes = g.nodes();
    nodes.forEach(node => {
        const similarity = roundNumber(alg(g, node, currNode));
        const linked = linkedQ(resolvedLinks, currNode, node);
        similarityArr.push({
            from: currNode,
            to: node,
            measure: similarity,
            linked
        })
    })
    return similarityArr;
}

export const SIMILARITY_TYPES: {
    subtype: string,
    alg: SimilarityAlg
}[] = [
        { subtype: 'Jaccard Similarity', alg: JaccardSimilarity }
    ]