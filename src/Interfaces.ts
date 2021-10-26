import type { Graph } from 'graphlib'
import type MyGraph from 'src/MyGraph'

export interface ResolvedLinks {
  [from: string]: {
    [to: string]: number
  }
}

export type Analyses =
  // "Centrality" |
  'Similarity' | 'Link Prediction' | 'Co-Citations'

export type Subtypes =
  | 'Adamic Adar'
  | 'Common Neighbours'
  | 'Jaccard'
  | 'Co-Citations'
// | 'Closeness'

export type GraphData = {
  [matrix in Subtypes]: number[][] | CoCitationRes[][]
}

export interface CoCitation {
  sentence: string[]
  measure: number
  source: string
  line: number
}

export interface CoCitationRes {
  measure: number
  coCitations: CoCitation[]
}

export type AnalysisAlg<T> = (a: string) => Promise<T>

export interface GraphAnalysisSettings {
  noInfinity: boolean
  noZero: boolean
  defaultAnalysisType: Analyses
  debugMode: boolean
  superDebugMode: boolean
}

export type AnalysisForAll = (
  alg: AnalysisAlg<number[]>,
  g: Graph,
  currNode: string
) => MyGraph
