import type { Graph } from "graphlib";

export interface SimilarityObj {
    node1: string,
    node2: string,
    similarity: number
};

export type SimilarityAlg = (g: Graph, node1: string, node2: string) => number;

export interface CentralityObj {
    node: string,
    centrality: number
}

export type CentralityAlg = (g: Graph) => CentralityObj[];

export interface GraphAnalysisSettings {
    mySetting: string;
    debugMode: boolean;
    superDebugMode: boolean;
}