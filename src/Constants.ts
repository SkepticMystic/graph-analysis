import type { Analyses, GraphAnalysisSettings } from 'src/Interfaces'

export const DEFAULT_SETTINGS: GraphAnalysisSettings = {
  noInfinity: true,
  noZero: true,
  defaultAnalysisType: 'Co-Citations',
  debugMode: false,
  superDebugMode: false,
}

export const DECIMALS = 4

export const VIEW_TYPE_GRAPH_ANALYSIS = 'graph-analysis'

export const ANALYSIS_TYPES: Analyses[] = [
  // 'Centrality',
  'Link Prediction',
  'Similarity',
  'Co-Citations',
]

export const LINKED = 'analysis-linked'
export const NOT_LINKED = 'analysis-not-linked'

export const TD_MEASURE = 'analysis-measure'
export const TD_NODE = 'analysis-node'

export const CENTRALITY_TYPES: {
  subtype: string
}[] = [{ subtype: 'Closeness' }]

export const LINK_PREDICTION_TYPES: {
  subtype: string
}[] = [{ subtype: 'Adamic Adar' }, { subtype: 'Common Neighbours' }]

export const SIMILARITY_TYPES: {
  subtype: string
}[] = [{ subtype: 'Jaccard' }]
