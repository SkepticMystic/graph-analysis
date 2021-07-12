import type { Graph } from "graphlib";

export interface LinkPredictionObj {
    a: string,
    b: string,
    prediction: number
};

export type LinkPredictionAlg = (g: Graph, a: string, b: string) => number;

export interface CentralityObj {
    a: string,
    centrality: number
}

export type CentralityAlg = (g: Graph) => CentralityObj[];

export interface SimilarityObj {
    a: string,
    b: string,
    similarity: number
}

export type SimilarityAlg = (g: Graph, currNode: string) => SimilarityObj[];

export interface GraphAnalysisSettings {
    mySetting: string;
    debugMode: boolean;
    superDebugMode: boolean;
}