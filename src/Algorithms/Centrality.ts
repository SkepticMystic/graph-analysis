import * as graphlib from "graphlib";
import type { Graph } from "graphlib";

export function closenessCentrality(g: Graph) {
	const allPaths = graphlib.alg.dijkstraAll(g);

	const nodeCloseness: Record<string, number> = {};

	for (const source in allPaths) {
		const distances = [];

		for (const node in allPaths[source]) {
			const dist = allPaths[source][node].distance;
			if (dist < Infinity) {
				distances.push(dist);
			}
		}

		if (distances.length > 0) {
			nodeCloseness[source] = (g.nodes().length - 1) / this.sum(distances);
		} else {
			nodeCloseness[source] = 0
		}
	}
	return nodeCloseness;
}