import type { Graph } from "graphlib";

export interface ResolvedLinks {
    [from: string]: {
        [to: string]: number
    }
}

export interface AnalysisObj {
    from: string,
    to: string,
    measure: number,
    linked: boolean
};

export interface AnalysisAlg {

}

export type LinkPredictionAlg = (g: Graph, a: string, b: string) => number;

export type CentralityAlg = (g: Graph, a: string) => number;

export type SimilarityAlg = (g: Graph, a: string, b: string) => number;

export interface GraphAnalysisSettings {
    noInfinity: boolean;
    noZero: boolean;
    debugMode: boolean;
    superDebugMode: boolean;
}

export type AnalysisForAll = (
    alg: LinkPredictionAlg | CentralityAlg | SimilarityAlg,
    g: Graph,
    currNode: string,
    resolvedLinks: ResolvedLinks) => AnalysisObj[]