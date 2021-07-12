import type { Graph } from "graphlib";
import * as graphlib from "graphlib";
import { sum } from "src/Utility";
import type { Centrality } from "src/Interfaces";

export function closenessCentrality(g: Graph) {
	const nodeCloseness: Centrality[] = [];
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
			console.log({ distances })
			const closeness = (g.nodes().length - 1) / sum(distances);
			nodeCloseness.push({ node: source, centrality: closeness });
		} else {
			nodeCloseness.push({ node: source, centrality: 0 });
		}
	}
	return nodeCloseness;
}