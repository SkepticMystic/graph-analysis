import { ItemView, WorkspaceLeaf } from 'obsidian'
import { VIEW_TYPE_GRAPH_ANALYSIS } from 'src/Constants'
import type { Subtype } from 'src/Interfaces'
import type GraphAnalysisPlugin from 'src/main'
import AnalysisComponent from './Components/AnalysisComponent.svelte'

export default class AnalysisView extends ItemView {
  plugin: GraphAnalysisPlugin
  currSubtype: Subtype
  component: AnalysisComponent

  constructor(
    leaf: WorkspaceLeaf,
    plugin: GraphAnalysisPlugin,
    currSubtype: Subtype | null
  ) {
    super(leaf)
    this.plugin = plugin
    this.currSubtype = currSubtype
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
    await this.draw(this.currSubtype ?? this.plugin.settings.defaultSubtypeType)
  }

  onClose(): Promise<void> {
    return Promise.resolve()
  }

  async draw(currSubtype: Subtype): Promise<void> {
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
        currSubtype,
      },
    })
  }
}
