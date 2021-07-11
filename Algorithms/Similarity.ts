import { Graph } from "graphlib";
import { nodeIntersection, sum } from "Utility";

export function adamicAdarSimilarity(g: Graph, node1: string, node2: string) {
    const [neighbours1, neighbours2] = [g.neighbors(node1) as string[], g.neighbors(node2) as string[]];
    const commonNodes = nodeIntersection(neighbours1, neighbours2);

    return sum(commonNodes.map(node => 1 / Math.log((g.neighbors(node) as string[]).length)))
}