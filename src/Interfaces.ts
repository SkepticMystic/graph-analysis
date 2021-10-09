import type { Graph } from "graphlib";
import type MyGraph from "src/MyGraph";

export interface ResolvedLinks {
    [from: string]: {
        [to: string]: number
    }
}

export type Analyses =
    // "Centrality" | 
    "Similarity" |
    "Link Prediction"

export type Subtypes =
    'Adamic Adar'
    | 'Common Neighbours'
    | 'Jaccard'
    | 'Co-Citations'
    | 'testSubtype'
// | 'Closeness'

export type GraphData = {
    [matrix in Subtypes]: number[][];
};

export type AnalysisAlg = (a: string) => Promise<number[]>;

export interface GraphAnalysisSettings {
    noInfinity: boolean;
    noZero: boolean;
    defaultAnalysisType: Analyses;
    debugMode: boolean;
    superDebugMode: boolean;
}

export type AnalysisForAll = (
    alg: AnalysisAlg,
    g: Graph,
    currNode: string
) => MyGraph