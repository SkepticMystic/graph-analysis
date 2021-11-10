import type { Graph } from 'graphlib'
import type { EditorPosition, EditorSelection } from 'obsidian'
import type MyGraph from 'src/MyGraph'

export interface ResolvedLinks {
  [from: string]: {
    [to: string]: number
  }
}

export type SubtypeDesc = {
  subtype: Subtype
  desc: string
}

export type Analyses =
  | 'Link Prediction'
  | 'Similarity'
  | 'Co-Citations'
  | 'Community Detection'

export type Subtype =
  | 'Adamic Adar'
  | 'Common Neighbours'
  | 'Jaccard'
  | 'Co-Citations'
  | 'Label Propagation'
  | 'Overlap'
  | 'Clustering Coefficient'

export interface Communities {
  [group: string]: string[]
}
export interface ResultMap {
  [to: string]: { measure: number; extra: string[] }
}

export interface ComponentResults {
  measure: number
  linked: boolean
  to: string
  resolved: boolean
  extra: any
  img: Promise<ArrayBuffer>
}

export interface CoCitation {
  sentence: string[]
  measure: number
  source: string
  line: number
}

export interface CoCitationRes {
  measure: number
  resolved: boolean
  coCitations: CoCitation[]
}

export interface CoCitationMap {
  [linkName: string]: CoCitationRes
}

export type AnalysisAlg<T> = (a: string, options?: {}) => Promise<T>

export interface GraphAnalysisSettings {
  noInfinity: boolean
  noZero: boolean
  allFileExtensions: boolean
  addUnresolved: boolean
  coTags: boolean
  defaultSubtypeType: Subtype
  debugMode: boolean
  superDebugMode: boolean
  exclusionRegex: string
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
