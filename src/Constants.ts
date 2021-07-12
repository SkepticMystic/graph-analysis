import { closenessCentrality } from "src/Algorithms/Centrality";
import { adamicAdarSimilarity, commonNeighboursSimilarity } from "src/Algorithms/Similarity";
import type { CentralityAlg, GraphAnalysisSettings, SimilarityAlg } from "src/Interfaces";

export const DEFAULT_SETTINGS: GraphAnalysisSettings = {
    mySetting: 'default',
    debugMode: false,
    superDebugMode: false,
}

export const VIEW_TYPE_GRAPH_ANALYSIS = 'graph-analysis';

export const ANALYSIS_TYPES = ['Centrality', 'Similarity']

export const CENTRALITY_TYPES: {
    subtype: string,
    alg: CentralityAlg
}[] = [{ subtype: 'Closeness', alg: closenessCentrality }]


export const SIMILARITY_TYPES: {
    subtype: string,
    alg: SimilarityAlg
}[] = [
        { subtype: 'Adamic Adar', alg: adamicAdarSimilarity },
        { subtype: 'Common Neighbours', alg: commonNeighboursSimilarity }
    ]