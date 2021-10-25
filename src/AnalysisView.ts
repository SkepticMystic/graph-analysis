import { ItemView, WorkspaceLeaf } from 'obsidian'
import { ANALYSIS_TYPES, VIEW_TYPE_GRAPH_ANALYSIS } from 'src/Constants'
import type { Analyses } from 'src/Interfaces'
import type GraphAnalysisPlugin from 'src/main'
import { claim_component } from 'svelte/internal'
import CoCitations from './Components/CoCitations.svelte'
import LinkPrediction from './Components/LinkPrediction.svelte'
import Similarity from './Components/Similarity.svelte'

export default class AnalysisView extends ItemView {
  private plugin: GraphAnalysisPlugin
  // private view: Analysis;

  constructor(leaf: WorkspaceLeaf, plugin: GraphAnalysisPlugin) {
    super(leaf)
    this.plugin = plugin
  }

  async onload(): Promise<void> {
    super.onload()
  }

  getViewType(): string {
    return VIEW_TYPE_GRAPH_ANALYSIS
  }

  getDisplayText(): string {
    return 'Graph Analysis'
  }

  // icon = TRAIL_ICON;

  async onOpen(): Promise<void> {
    await this.draw()
  }

  onClose(): Promise<void> {
    return Promise.resolve()
  }

  async draw(): Promise<void> {
    const app = this.app
    const { settings } = this.plugin
    const contentEl = this.contentEl
    contentEl.empty()

    const settingsDiv = contentEl.createDiv({ text: 'Analysis: ' })
    const selector = settingsDiv.createEl('select', { cls: 'dropdown GA-DD' })
    ANALYSIS_TYPES.forEach((type) => {
      selector.createEl('option', { value: type, text: type })
    })
    const refreshGraphButton = settingsDiv.createEl(
      'button',
      { text: 'Refresh', cls: 'GA-Refresh-Button' },
      (but) => {
        but.addEventListener('click', async () => {
          await this.plugin.refreshGraph()
          await this.draw()
        })
      }
    )

    const componentDiv = contentEl.createDiv()

    const drawComponent = (type: Analyses, componentDiv: HTMLDivElement) => {
      if (!ANALYSIS_TYPES.includes(type)) {
        throw new Error(`${type} is not one of the analysis types`)
      }
      componentDiv.empty()

      const componentInfo = {
        target: componentDiv,
        props: {
          app,
          plugin: this.plugin,
          settings,
          view: this,
        },
      }
      switch (type) {
        // case 'Centrality':
        //     new Centrality(componentInfo)
        //     break
        case 'Co-Citations':
          new CoCitations(componentInfo)
          break
        case 'Link Prediction':
          new LinkPrediction(componentInfo)
          break
        case 'Similarity':
          new Similarity(componentInfo)
          break
      }
    }
    // Default Analysis Type
    selector.value = settings.defaultAnalysisType
    drawComponent(selector.value as Analyses, componentDiv)

    selector.addEventListener('change', () => {
      drawComponent(selector.value as Analyses, componentDiv)
    })
  }
}
