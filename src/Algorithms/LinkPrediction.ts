import type { Graph } from "graphlib";
import { nodeIntersection } from "src/GeneralGraphFn";
import type { LinkPredictionAlg, LinkPredictionObj } from "src/Interfaces";
import { roundNumber, sum } from "src/Utility";

const adamicAdarLinkPrediction: LinkPredictionAlg = (g: Graph, a: string, b: string): number => {
    const [Na, Nb] = [g.neighbors(a) as string[], g.neighbors(b) as string[]];
    const Nab = nodeIntersection(Na, Nb);

    if (Nab.length) {
        const neighbours: number[] = Nab.map(node => (g.successors(node) as string[]).length)
        return roundNumber(sum(neighbours.map(neighbour => 1 / Math.log(neighbour))))
    } else {
        return Infinity
    }
}

export { adamicAdarLinkPrediction };

export const commonNeighboursLinkPrediction: LinkPredictionAlg = (g: Graph, a: string, b: string): number => {
    const [Na, Nb] = [g.neighbors(a) as string[], g.neighbors(b) as string[]];
    const Nab = nodeIntersection(Na, Nb)
    return Nab.length
}

export const linkPredictionsForAll = (
    type: LinkPredictionAlg,
    g: Graph,
    currNode: string): LinkPredictionObj[] => {
    const predictions: LinkPredictionObj[] = []
    const paths = g.nodes();

    for (let i = 0; i < paths.length; i++) {
        const a = paths[i];

        const prediction = type(g, a, currNode)
        predictions[i] = { a, b: currNode, prediction }
    }
    return predictions
}

export const LINK_PREDICTION_TYPES: {
    subtype: string,
    alg: LinkPredictionAlg
}[] = [
        { subtype: 'Adamic Adar', alg: adamicAdarLinkPrediction },
        { subtype: 'Common Neighbours', alg: commonNeighboursLinkPrediction }
    ]