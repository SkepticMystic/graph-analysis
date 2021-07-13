import type { Graph } from "graphlib";
import * as graphlib from "graphlib";
import { roundNumber, sum } from "src/Utility";
import type { CentralityAlg, CentralityObj } from "src/Interfaces";

export const closenessCentrality: CentralityAlg = (g: Graph, a: string): CentralityObj => {
	const paths = graphlib.alg.dijkstra(g, a);

	const distances = [];
	for (const target in paths) {
		const dist = paths[target].distance;
		if (dist < Infinity) {
			distances.push(dist);
		}
	}

	if (distances.length > 0) {
		const closeness = roundNumber((g.nodes().length - 1) / sum(distances));
		return { a, centrality: closeness };
	} else {
		return { a, centrality: 0 };
	}
}

export function centrailyForAll(alg: CentralityAlg, g: Graph) {
	const nodes = g.nodes();
	return nodes.map(node => alg(g, node))
}

export const CENTRALITY_TYPES: {
	subtype: string,
	alg: CentralityAlg
}[] = [{ subtype: 'Closeness', alg: closenessCentrality }]