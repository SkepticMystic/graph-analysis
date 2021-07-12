import { Graph } from "graphlib";
import "lodash.isequal";
import type { App } from "obsidian";

export function nodeIntersection(nodes1: string[], nodes2: string[]) {
    return nodes1.filter(node1 => nodes2.includes(node1));
}

export const sum = (arr: number[]) => {
    if (arr.length === 0) { return 0 }
    return arr.reduce((a, b) => a + b);
}

export function initGraph(app: App): Graph {
    const { resolvedLinks } = app.metadataCache
    const g = new Graph();

    for (const source in resolvedLinks) {
        g.setNode(source);
        for (const dest in resolvedLinks[source]) {
            g.setEdge(source, dest);
        }
    }
    return g
}