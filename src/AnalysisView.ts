import { ItemView, WorkspaceLeaf } from "obsidian";
import { ANALYSIS_TYPES, VIEW_TYPE_GRAPH_ANALYSIS } from "src/Constants";
import type GraphAnalysisPlugin from "src/main";
import { initGraph } from "src/Utility";
import Similarity from "./Similarity.svelte";
import Centrality from "./Centrality.svelte";
import type { GraphAnalysisSettings } from "src/Interfaces";

export default class AnalysisView extends ItemView {
    private plugin: GraphAnalysisPlugin;
    // private view: Analysis;
    private noInfinity: boolean = false;

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
        const plugin = this.plugin;
        const app = this.app
        const settings = this.plugin.settings
        const contentEl = this.contentEl
        contentEl.empty();

        const g = initGraph(this.plugin.app);


        const settingsSpan = contentEl.createSpan({ text: 'Choose an analysis type: ' })
        const selector = settingsSpan.createEl('select');
        ANALYSIS_TYPES.forEach(type => {
            selector.createEl('option', { value: type, text: type });
        })

        const componentDiv = contentEl.createDiv();

        const drawComponent = (
            type: string,
            componentDiv: HTMLDivElement) => {
            componentDiv.empty();
            const componentInfo = {
                target: componentDiv,
                props: {
                    app,
                    g,
                    settings,
                    view: this
                }
            };
            switch (type) {
                case 'Closeness':
                    new Centrality(componentInfo)
                    break
                case 'Similarity':
                    new Similarity(componentInfo)
                    break
            };
        }

        drawComponent('Closeness', componentDiv)

        selector.addEventListener('change', () => {
            drawComponent(selector.value, componentDiv)
        })

    }
}