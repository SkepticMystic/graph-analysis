import { ItemView, WorkspaceLeaf } from "obsidian";
import { ANALYSIS_TYPES, VIEW_TYPE_GRAPH_ANALYSIS } from "src/Constants";
import { eccentricity, initGraph } from "src/GeneralGraphFn";
import type GraphAnalysisPlugin from "src/main";
import Centrality from "./Components/Centrality.svelte";
import LinkPrediction from "./Components/LinkPrediction.svelte";
import Similarity from "./Components/Similarity.svelte";

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

            if (!ANALYSIS_TYPES.includes(type)) { throw new Error(`${type} is not one of the analysis types`) }

            componentDiv.empty();

            const { resolvedLinks } = this.app.metadataCache

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
                case 'Centrality':
                    new Centrality(componentInfo)
                    break
                case 'Link Prediction':
                    new LinkPrediction(componentInfo)
                    break
                case 'Similarity':
                    new Similarity(componentInfo)
                    break
            };
        }
        // Default Analysis Type
        selector.value = 'Similarity'
        drawComponent('Similarity', componentDiv)

        selector.addEventListener('change', () => {
            drawComponent(selector.value, componentDiv)
        })
    }
}