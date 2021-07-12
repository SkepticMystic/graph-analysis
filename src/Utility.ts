import { Graph } from "graphlib";
import type { App } from "obsidian";
import type { GraphAnalysisSettings } from "src/Interfaces";

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
        const sourceNoMD = source.split('.md', 1)[0]
        g.setNode(sourceNoMD);
        for (const dest in resolvedLinks[source]) {
            const destNoMD = dest.split('.md')[0]
            g.setEdge(sourceNoMD, destNoMD);
        }
    }
    console.log({ g })
    return g
}

export function debug<T>(settings: GraphAnalysisSettings, log: T): void {
    if (settings.debugMode) {
        console.log(log)
    }
}

export function superDebug<T>(settings: GraphAnalysisSettings, log: T): void {
    if (settings.superDebugMode) {
        console.log(log)
    }
}