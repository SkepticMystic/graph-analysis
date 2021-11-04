import { addIcon, Notice, Plugin, WorkspaceLeaf } from 'obsidian'
import AnalysisView from 'src/AnalysisView'
import {
  DEFAULT_SETTINGS,
  iconSVG,
  VIEW_TYPE_GRAPH_ANALYSIS,
} from 'src/constants'
import type { Analyses, GraphAnalysisSettings } from 'src/Interfaces'
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
    addIcon('GA-ICON', iconSVG)

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

    this.addCommand({
      id: 'refresh-analysis-view',
      name: 'Refresh Graph Analysis View',
      callback: async () => {
        await this.refreshGraph()
        const openView = this.app.workspace.getLeavesOfType(
          VIEW_TYPE_GRAPH_ANALYSIS
        )[0].view as AnalysisView
        openView.draw(openView.analysisSelector.value as Analyses)
      },
    })

    this.addCommand({
      id: 'label-prop',
      name: 'Label Propagation',
      callback: async () => {
        const currNode = this.app.workspace.getActiveFile().basename
        const comms = await this.g.algs['Label Propagation'](currNode)
        console.log(comms)
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
      // await this.g.initData()
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

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
