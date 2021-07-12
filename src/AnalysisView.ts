import { ItemView, WorkspaceLeaf } from "obsidian";
import { ANALYSIS_TYPES, VIEW_TYPE_GRAPH_ANALYSIS } from "src/Constants";
import type GraphAnalysisPlugin from "src/main";
import { initGraph } from "src/Utility";
import Similarity from "./Similarity.svelte";
import Centrality from "./Centrality.svelte";

export default class AnalysisView extends ItemView {
    private plugin: GraphAnalysisPlugin;
    // private view: Analysis;

    constructor(leaf: WorkspaceLeaf, plugin: GraphAnalysisPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    async onload(): Promise<void> {
        super.onload();
    }

    getViewType(): string {
        return VIEW_TYPE_GRAPH_ANALYSIS;
    }

    getDisplayText(): string {
        return "Graph Analysis";
    }

    // icon = TRAIL_ICON;

    async onOpen(): Promise<void> {
        await this.draw()
    }

    onClose(): Promise<void> {
        return Promise.resolve();
    }

    async draw(): Promise<void> {
        const g = initGraph(this.plugin.app);
        const componentInfo = {
            target: this.contentEl,
            props: { g, settings: this.plugin.settings }
        }
        const contentEl = this.contentEl
        contentEl.empty();

        const analysisTypeSpan = contentEl.createSpan({ text: 'Choose an analysis type: ' })
        const selector = analysisTypeSpan.createEl('select');
        ANALYSIS_TYPES.forEach(type => {
            selector.createEl('option', { value: type, text: type });
        })

        new Centrality(componentInfo)

        selector.addEventListener('change', () => {
            contentEl.empty()
            switch (selector.value) {
                case 'Closeness':
                    contentEl.empty()
                    new Centrality(componentInfo)
                    break
                case 'Similarity':
                    contentEl.empty()
                    new Similarity(componentInfo)
                    break
            }
        })
    }
}