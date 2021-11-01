import { Notice, Plugin, WorkspaceLeaf } from 'obsidian'
import AnalysisView from 'src/AnalysisView'
import { DEFAULT_SETTINGS, VIEW_TYPE_GRAPH_ANALYSIS } from 'src/constants'
import type { GraphAnalysisSettings } from 'src/Interfaces'
import MyGraph from 'src/MyGraph'
import { SampleSettingTab } from 'src/Settings'
import { debug } from './Utility'
import { openView, wait } from 'obsidian-community-lib'

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
        let checkResult =
          this.app.workspace.getLeavesOfType(VIEW_TYPE_GRAPH_ANALYSIS)
            .length === 0

        if (checkResult) {
          // Only perform work when checking is false
          if (!checking) {
            openView(this.app, VIEW_TYPE_GRAPH_ANALYSIS, AnalysisView)
          }
          return true
        }
      },
    })

    this.addSettingTab(new SampleSettingTab(this.app, this))

    this.registerView(
      VIEW_TYPE_GRAPH_ANALYSIS,
      (leaf: WorkspaceLeaf) => new AnalysisView(leaf, this)
    )

    this.app.workspace.onLayoutReady(async () => {
      const noFiles = this.app.vault.getMarkdownFiles().length
      while (!this.resolvedLinksComplete(noFiles)) {
        await wait(1000)
      }

      await this.refreshGraph()
      await openView(this.app, VIEW_TYPE_GRAPH_ANALYSIS, AnalysisView)

      // setTimeout(async () => {
      //   if (this.app.metadataCache.resolvedLinks) {
      //     await this.refreshGraph()
      //     await openView(this.app, VIEW_TYPE_GRAPH_ANALYSIS, AnalysisView)
      //   } else {
      //     setTimeout(async () => {
      //       if (this.app.metadataCache.resolvedLinks) {
      //         await this.refreshGraph()
      //         await openView(this.app, VIEW_TYPE_GRAPH_ANALYSIS, AnalysisView)
      //       } else {
      //         setTimeout(async () => {
      //           await this.refreshGraph()
      //           await openView(this.app, VIEW_TYPE_GRAPH_ANALYSIS, AnalysisView)
      //         }, 8000)
      //       }
      //     }, 8000)
      //   }
      // }, 8000)
    })
  }

  resolvedLinksComplete(noFiles: number) {
    const { resolvedLinks } = this.app.metadataCache
    return Object.keys(resolvedLinks).length === noFiles
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
      new Notice(
        'An error occured with Graph Analysis, please check the console.'
      )
    }
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

  // initView = async (): Promise<void> => {
  //   let leaf: WorkspaceLeaf = null
  //   for (leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_GRAPH_ANALYSIS)) {
  //     if (leaf.view instanceof AnalysisView) {
  //       return
  //     }
  //     await leaf.setViewState({ type: 'empty' })
  //     break
  //   }
  //   ;(leaf ?? this.app.workspace.getRightLeaf(false)).setViewState({
  //     type: VIEW_TYPE_GRAPH_ANALYSIS,
  //     active: true,
  //   })
  // }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
