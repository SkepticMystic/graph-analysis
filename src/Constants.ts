import type { GraphAnalysisSettings } from "src/Interfaces";

export const DEFAULT_SETTINGS: GraphAnalysisSettings = {
    mySetting: 'default',
    debugMode: false,
    superDebugMode: false,
}

export const VIEW_TYPE_GRAPH_ANALYSIS = 'graph-analysis';

export const ANALYSIS_TYPES = ['Closeness', 'Similarity']