import { ItemView, WorkspaceLeaf } from 'obsidian'
import { VIEW_TYPE_GRAPH_ANALYSIS } from 'src/Constants'
import type { Subtype } from 'src/Interfaces'
import type GraphAnalysisPlugin from 'src/main'
import AnalysisComponent from './Components/AnalysisComponent.svelte'

export default class AnalysisView extends ItemView {
  private plugin: GraphAnalysisPlugin
  currSubtype: Subtype
  private component: AnalysisComponent

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

  icon = 'GA-ICON'

  async onOpen(): Promise<void> {
    this.currSubtype = this.plugin.settings.defaultSubtypeType
    await this.draw()
  }

  onClose(): Promise<void> {
    return Promise.resolve()
  }

  async draw(): Promise<void> {
    const { app, contentEl } = this
    const { settings } = this.plugin

    contentEl.empty()
    contentEl.addClass('GA-View')

    // this.component?.$destroy()

    this.component = new AnalysisComponent({
      target: contentEl,
      props: {
        app,
        plugin: this.plugin,
        settings,
        view: this,
        currSubtype: this.currSubtype,
      },
    })
  }
}
