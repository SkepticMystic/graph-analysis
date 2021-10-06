import * as graphlib from "graphlib";
import type { Graph } from "graphlib";

export function nodeIntersection(nodes1: string[], nodes2: string[]) {
    return (nodes1?.filter(node1 => nodes2.includes(node1)) ?? []);
}

// export function initGraph(app: App): Graph {
//     const { resolvedLinks } = app.metadataCache
//     const g = new MyGraph(resolvedLinks);
//     let i = 0;
//     for (const source in resolvedLinks) {
//         const sourceNoMD = source.split('.md', 1)[0]
//         g.setNode(sourceNoMD, i);
//         i++;
//         for (const dest in resolvedLinks[source]) {
//             const destNoMD = dest.split('.md')[0]
//             g.setEdge(sourceNoMD, destNoMD);
//         }
//     }
//     return g
// }

export function currAlg<T>(types: { subtype: string, alg: T }[], value: string) {
    return types.filter(type => type.subtype === value)[0].alg
}

export function eccentricity(g: Graph, a: string) {
    const paths = graphlib.alg.dijkstra(g, a);
    const pathsArr: [string, graphlib.Path][] = Object.entries(paths)
    const sortedPaths = pathsArr.sort((p, q) => p[1].distance > q[1].distance ? 1 : -1);
    return sortedPaths
}