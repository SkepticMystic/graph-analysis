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

export const iconSVG = `<path fill="currentColor" stroke="currentColor" d="M88.8,67.5c-3,0-5.7,1.2-7.7,3.1l-12.2-7c0.7-1.9,1.2-3.9,1.2-6.1C70,47.8,62.2,40,52.5,40c-1.3,0-2.6,0.2-3.8,0.5l-5-10.8
c2.3-2.1,3.8-5,3.8-8.4c0-6.2-5-11.3-11.3-11.3S25,15,25,21.3s5,11.3,11.3,11.3c0.1,0,0.3,0,0.4,0l5.2,11.2
c-4.2,3.2-6.9,8.2-6.9,13.8C35,67.2,42.8,75,52.5,75c4.8,0,9.2-1.9,12.3-5.1l12.8,7.3c-0.1,0.5-0.2,1-0.2,1.5
c0,6.2,5,11.3,11.3,11.3S100,85,100,78.7S95,67.5,88.8,67.5z M36.3,25c-2.1,0-3.8-1.7-3.8-3.8s1.7-3.8,3.8-3.8s3.8,1.7,3.8,3.8
S38.3,25,36.3,25z M52.5,67.5c-5.5,0-10-4.5-10-10s4.5-10,10-10s10,4.5,10,10S58,67.5,52.5,67.5z M88.8,82.5c-2.1,0-3.8-1.7-3.8-3.8
s1.7-3.8,3.8-3.8s3.8,1.7,3.8,3.8S90.8,82.5,88.8,82.5z M80.3,41.7l-3-4l-7.5,5.6l3,4L80.3,41.7z M90,40c5.5,0,10-4.5,10-10
s-4.5-10-10-10s-10,4.5-10,10S84.5,40,90,40z M23.8,60h7.5v-5h-7.5V60z M10,47.5c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10
S15.5,47.5,10,47.5z"/>`
