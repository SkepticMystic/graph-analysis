import type { GraphAnalysisSettings } from "src/Interfaces";

export const DEFAULT_SETTINGS: GraphAnalysisSettings = {
    noInfinity: false,
    noZero: false,
    debugMode: false,
    superDebugMode: false,
}

export const DECIMALS = 4;

export const VIEW_TYPE_GRAPH_ANALYSIS = 'graph-analysis';

export const ANALYSIS_TYPES = ['Centrality', 'Link Prediction', 'Similarity']

export const LINKED = 'analysis-linked';
export const NOT_LINKED = 'analysis-not-linked';


