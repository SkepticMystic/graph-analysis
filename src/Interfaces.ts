import type { Graph } from "graphlib";
import type MyGraph from "src/MyGraph";

export interface ResolvedLinks {
    [from: string]: {
        [to: string]: number
    }
}



export type Analyses = "Centrality" | "Similarity" | "Link Prediction"

export type Subtypes = 'Adamic Adar' | 'Common Neighbours' | 'Jaccard' | 'Closeness'
export type GraphData = {
    [matrix in Subtypes]: number[][];
};

export type AnalysisAlg = (a: string, b?: string) => number;

export interface GraphAnalysisSettings {
    noInfinity: boolean;
    noZero: boolean;
    debugMode: boolean;
    superDebugMode: boolean;
}

export type AnalysisForAll = (
    alg: AnalysisAlg,
    g: Graph,
    currNode: string) => MyGraph