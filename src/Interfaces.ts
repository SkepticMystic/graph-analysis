import type { Graph } from 'graphlib'
import type { EditorPosition, EditorSelection } from 'obsidian'
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
  [matrix in Subtypes]: number[][] | CoCitationMap[]
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

export interface CoCitationMap {
  [linkName: string]: CoCitationRes
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

declare module 'obsidian' {
  interface Editor {
    cm: {
      findWordAt: (pos: EditorPosition) => EditorSelection | null
      state: {
        wordAt: (offset: number) => { fromOffset: number; toOffset: number }
      }
      getDoc: () => Doc
      getScrollInfo: () => { top: number; left: number; clientHeight: number }
    }
  }

  interface Doc {
    markText: (
      from: EditorPosition,
      to: EditorPosition,
      options?: { className?: string }
    ) => TextMarker
    children: LeafChunk[]
  }

  interface LeafChunk {
    lines: Line[]
  }

  interface TextMarker {
    className: string
    doc: Doc
    id: number
    lines: Line[]
    type: string
    clear: () => void
  }

  interface Line {
    markedSpans: MarkedSpan[]
    text: string
    parent: LeafChunk
  }

  interface MarkedSpan {
    from: number
    to: number
    marker: TextMarker
  }

  interface WorkspaceItem {
    side: 'left' | 'right'
  }
}
