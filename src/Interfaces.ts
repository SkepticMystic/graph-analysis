import type { Graph } from 'graphlib'
import type { EditorPosition, EditorSelection } from 'obsidian'
import type { ANALYSIS_TYPES } from 'src/constants'
import type MyGraph from 'src/MyGraph'

export interface ResolvedLinks {
  [from: string]: {
    [to: string]: number
  }
}

export type SubtypeDesc = {
  subtype: string
  desc: string
}[]

export type Analyses = typeof ANALYSIS_TYPES[number]

export type Subtype =
  | 'Adamic Adar'
  | 'Common Neighbours'
  | 'Jaccard'
  | 'Co-Citations'
  | 'Label Propagation'
// | 'Closeness'

export interface Communities {
  [group: string]: string[]
}
export interface ResultMap {
  [to: string]: { measure: number; extra: any }
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

export type AnalysisAlg<T> = (a: string, options?: {}) => Promise<T>

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
  interface App {
    plugins: {
      plugins: {
        metaedit: {
          api: {
            createYamlProperty(
              key: string,
              value: string,
              file: TFile
            ): Promise<void>
            update(key: string, value: string, file: TFile): Promise<void>
          }
        }
      }
    }
  }
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
