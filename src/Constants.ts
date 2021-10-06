import type { Analyses, GraphAnalysisSettings } from "src/Interfaces";

export const DEFAULT_SETTINGS: GraphAnalysisSettings = {
    noInfinity: false,
    noZero: false,
    debugMode: false,
    superDebugMode: false,
}

export const DECIMALS = 4;

export const VIEW_TYPE_GRAPH_ANALYSIS = 'graph-analysis';

export const ANALYSIS_TYPES: Analyses[] = [
    // 'Centrality',
    'Link Prediction',
    'Similarity'
]

export const LINKED = 'analysis-linked';
export const NOT_LINKED = 'analysis-not-linked';

export const TD_MEASURE = 'analysis-measure';
export const TD_NODE = 'analysis-node';


