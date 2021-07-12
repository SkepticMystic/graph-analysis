import type { Graph } from "graphlib";
import * as graphlib from "graphlib";
import { sum } from "src/Utility";
import type { CentralityAlg, CentralityObj } from "src/Interfaces";

export const closenessCentrality: CentralityAlg = (g: Graph) => {
	const nodeCloseness: CentralityObj[] = [];
	const allPaths = graphlib.alg.dijkstraAll(g);

	for (const source in allPaths) {
		const distances = [];

		for (const node in allPaths[source]) {
			const dist = allPaths[source][node].distance;
			// console.log({ node, dist })

			if (dist < Infinity) {
				distances.push(dist);
			}
		}

		if (distances.length > 0) {
			const closeness = (g.nodes().length - 1) / sum(distances);
			nodeCloseness.push({ a: source, centrality: closeness });
		} else {
			nodeCloseness.push({ a: source, centrality: 0 });
		}
	}
	return nodeCloseness;
}

export const CENTRALITY_TYPES: {
	subtype: string,
	alg: CentralityAlg
}[] = [{ subtype: 'Closeness', alg: closenessCentrality }]