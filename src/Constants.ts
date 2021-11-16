import type { GraphAnalysisSettings, SubtypeInfo } from 'src/Interfaces'

export const DEFAULT_SETTINGS: GraphAnalysisSettings = {
  noInfinity: true,
  noZero: true,
  allFileExtensions: true,
  showImgThumbnails: true,
  addUnresolved: true,
  coTags: true,
  defaultSubtypeType: 'Co-Citations',
  debugMode: false,
  superDebugMode: false,
  exclusionRegex: '',
  exclusionTags: [],
}

export const DECIMALS = 4

export const VIEW_TYPE_GRAPH_ANALYSIS = 'graph-analysis'

export const LINKED = 'GA-linked'
export const NOT_LINKED = 'GA-not-linked'

export const MEASURE = 'GA-measure'
export const NODE = 'GA-node'

export const ICON = 'GA-icon'

export const ANALYSIS_TYPES: SubtypeInfo[] = [
  {
    anl: 'Co-Citations',
    subtype: 'Co-Citations',
    desc: 'See which of your notes are referenced together most often.',
    global: false,
  },

  {
    anl: 'Link Prediction',
    subtype: 'Adamic Adar',
    desc: '<No description given yet>',
    global: false,
  },
  {
    anl: 'Link Prediction',
    subtype: 'Common Neighbours',
    desc: 'Tells you how many notes are linked to the current (active) note, and the note in the table.\nHover over a cell in the table to see a list of common neighbours',
    global: false,
  },

  {
    anl: 'Similarity',
    subtype: 'Jaccard',
    desc: '<No description given yet>',
    global: false,
  },
  {
    anl: 'Similarity',
    subtype: 'Overlap',
    desc: '<No description given yet>',
    global: false,
  },

  {
    anl: 'Community Detection',
    subtype: 'Label Propagation',
    desc: "Start by giving each node a unique label (its own name). Then, look at each node's neighbours, and change it's label to the most common among it's neighbours. Repeat this process `iterations` number of times. Show the nodes grouped by the last label they had.\n\n'🔗' means that this note is linked to the group name.",
    global: true,
  },
  {
    anl: 'Community Detection',
    subtype: 'Louvain',
    desc: 'Show the community that the current note is in',
    global: true,
  },
  {
    anl: 'Community Detection',
    subtype: 'Clustering Coefficient',
    desc: 'Gives the ratio of the number of triangles that `u` is a part of, to the number of triangles it possibly could have been a part of.\n\n**Interpretation**: The probability that this nodes _neighbours_ are connected.',
    global: true,
  },
]

export const IMG_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp']

export const iconSVG = `<path fill="currentColor" stroke="currentColor" d="M88.8,67.5c-3,0-5.7,1.2-7.7,3.1l-12.2-7c0.7-1.9,1.2-3.9,1.2-6.1C70,47.8,62.2,40,52.5,40c-1.3,0-2.6,0.2-3.8,0.5l-5-10.8
c2.3-2.1,3.8-5,3.8-8.4c0-6.2-5-11.3-11.3-11.3S25,15,25,21.3s5,11.3,11.3,11.3c0.1,0,0.3,0,0.4,0l5.2,11.2
c-4.2,3.2-6.9,8.2-6.9,13.8C35,67.2,42.8,75,52.5,75c4.8,0,9.2-1.9,12.3-5.1l12.8,7.3c-0.1,0.5-0.2,1-0.2,1.5
c0,6.2,5,11.3,11.3,11.3S100,85,100,78.7S95,67.5,88.8,67.5z M36.3,25c-2.1,0-3.8-1.7-3.8-3.8s1.7-3.8,3.8-3.8s3.8,1.7,3.8,3.8
S38.3,25,36.3,25z M52.5,67.5c-5.5,0-10-4.5-10-10s4.5-10,10-10s10,4.5,10,10S58,67.5,52.5,67.5z M88.8,82.5c-2.1,0-3.8-1.7-3.8-3.8
s1.7-3.8,3.8-3.8s3.8,1.7,3.8,3.8S90.8,82.5,88.8,82.5z M80.3,41.7l-3-4l-7.5,5.6l3,4L80.3,41.7z M90,40c5.5,0,10-4.5,10-10
s-4.5-10-10-10s-10,4.5-10,10S84.5,40,90,40z M23.8,60h7.5v-5h-7.5V60z M10,47.5c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10
S15.5,47.5,10,47.5z"/>`
