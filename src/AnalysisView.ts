import { Graph } from "graphlib";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_GRAPH_ANALYSIS } from "src/Constants";
import type GraphAnalysisPlugin from "src/main";
import { initGraph } from "src/main"
import Analysis from "./Analysis.svelte";

export default class AnalysisView extends ItemView {
    private plugin: GraphAnalysisPlugin;
    private view: Analysis;

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
        const g = initGraph()

        this.contentEl.empty();
        this.view = new Analysis({
            target: this.contentEl,
            props: {}
        })
    }
}