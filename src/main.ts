import { MarkdownView, Notice, Plugin, WorkspaceLeaf } from 'obsidian'
import AnalysisView from 'src/AnalysisView'
import { DEFAULT_SETTINGS, VIEW_TYPE_GRAPH_ANALYSIS } from 'src/constants'
import type { GraphAnalysisSettings } from 'src/Interfaces'
import MyGraph from 'src/MyGraph'
import { SampleSettingTab } from 'src/Settings'
import { debug } from './Utility'

export default class GraphAnalysisPlugin extends Plugin {
  settings: GraphAnalysisSettings
  g: MyGraph

  async onload() {
    console.log('loading graph analysis plugin')

    await this.loadSettings()

    this.addCommand({
      id: 'show-graph-analysis-view',
      name: 'Open Graph Analysis View',
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            this.app.workspace.getLeavesOfType(VIEW_TYPE_GRAPH_ANALYSIS)
              .length === 0
          )
        }
        this.initView()
      },
    })

    this.addSettingTab(new SampleSettingTab(this.app, this))

    this.app.workspace.onLayoutReady(async () => {
      // setTimeout(async () => {
      await this.refreshGraph()
      this.registerView(
        VIEW_TYPE_GRAPH_ANALYSIS,
        (leaf: WorkspaceLeaf) => new AnalysisView(leaf, this)
      )
      await this.initView(VIEW_TYPE_GRAPH_ANALYSIS)
      // }, 4000)
    })

    // this.registerEvent(this.app.workspace.on('active-leaf-change', () => {}))
  }

  async refreshGraph() {
    try {
      console.time('Initialise Graph')
      const { resolvedLinks } = this.app.metadataCache
      this.g = new MyGraph(resolvedLinks, this.app)
      await this.g.initGraph()
      await this.g.initData()
      debug(this.settings, { g: this.g })
      console.timeEnd('Initialise Graph')
      new Notice('Index Refreshed')
    } catch (error) {
      console.log(error)
      new Notice('An error occured, please check the console.')
    }
  }

  // withCodeMirrorEditor is a convenience function for making sure that a
  // function runs with a valid view and editor.
  withCodeMirrorEditor(
    callback: (editor: CodeMirror.Editor, view?: MarkdownView) => void
  ): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!view) {
      return
    }

    callback(view.sourceMode.cmEditor, view)
  }

  onunload() {
    console.log('unloading graph analysis plugin')
    this.app.workspace
      .getLeavesOfType(VIEW_TYPE_GRAPH_ANALYSIS)
      .forEach((leaf) => {
        leaf.view.unload()
        leaf.detach()
      })
  }

  initView = async (): Promise<void> => {
    let leaf: WorkspaceLeaf = null
    for (leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_GRAPH_ANALYSIS)) {
      if (leaf.view instanceof AnalysisView) {
        return
      }
      await leaf.setViewState({ type: 'empty' })
      break
    }
    ;(leaf ?? this.app.workspace.getRightLeaf(false)).setViewState({
      type: VIEW_TYPE_GRAPH_ANALYSIS,
      active: true,
    })
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
