export interface Similarity {
    node1: string,
    node2: string,
    similarity: number
};

export interface Centrality {
    node: string,
    centrality: number
}

export interface GraphAnalysisSettings {
    mySetting: string;
    debugMode: boolean;
    superDebugMode: boolean;
}