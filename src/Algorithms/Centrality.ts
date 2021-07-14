import type { Graph } from "graphlib";
import * as graphlib from "graphlib";
import type { AnalysisForAll, AnalysisObj, CentralityAlg, ResolvedLinks } from "src/Interfaces";
import { linkedQ, roundNumber, sum } from "src/Utility";

export const closenessCentrality: CentralityAlg = (g: Graph, a: string) => {
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
		return closeness;
	} else {
		return 0;
	}
}

export const centralityForAll: AnalysisForAll = (
	alg: CentralityAlg,
	g: Graph,
	currNode: string,
	resolvedLinks: ResolvedLinks) => {

	const nodes = g.nodes();
	const centralityArr: AnalysisObj[] = [];
	nodes.forEach(node => centralityArr.push({
		from: currNode,
		to: node,
		measure: alg(g, node),
		linked: linkedQ(resolvedLinks, currNode, node)
	}));
	return centralityArr
}

export const CENTRALITY_TYPES: {
	subtype: string,
	alg: CentralityAlg
}[] = [
		{ subtype: 'Closeness', alg: closenessCentrality }
	]