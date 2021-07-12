import { Graph } from "graphlib";
import type { App, ItemView, TFile, WorkspaceLeaf } from "obsidian";
import type { GraphAnalysisSettings } from "src/Interfaces";

export function nodeIntersection(nodes1: string[], nodes2: string[]) {
    return nodes1.filter(node1 => nodes2.includes(node1));
}

export const sum = (arr: number[]) => {
    if (arr.length === 0) { return 0 }
    return arr.reduce((a, b) => a + b);
}

export function initGraph(app: App): Graph {
    const { resolvedLinks } = app.metadataCache
    const g = new Graph();

    for (const source in resolvedLinks) {
        const sourceNoMD = source.split('.md', 1)[0]
        g.setNode(sourceNoMD);
        for (const dest in resolvedLinks[source]) {
            const destNoMD = dest.split('.md')[0]
            g.setEdge(sourceNoMD, destNoMD);
        }
    }
    console.log({ g })
    return g
}

export function debug<T>(settings: GraphAnalysisSettings, log: T): void {
    if (settings.debugMode) {
        console.log(log)
    }
}

export function superDebug<T>(settings: GraphAnalysisSettings, log: T): void {
    if (settings.superDebugMode) {
        console.log(log)
    }
}

export function hoverPreview(event: MouseEvent, view: ItemView): void {
    const targetEl = event.target as HTMLElement;

    view.app.workspace.trigger("hover-link", {
        event,
        source: view.getViewType(),
        hoverParent: view,
        targetEl,
        linktext: targetEl.innerText,
    });
}

export async function openOrSwitch(
    app: App,
    dest: string,
    currFile: TFile,
    event: MouseEvent,
): Promise<void> {
    const { workspace } = app;
    const destFile = app.metadataCache.getFirstLinkpathDest(dest, currFile.path);

    const openLeaves: WorkspaceLeaf[] = [];
    // For all open leaves, if the leave's basename is equal to the link destination, rather activate that leaf instead of opening it in two panes
    workspace.iterateAllLeaves((leaf) => {
        if (leaf.view?.file?.basename === dest) {
            openLeaves.push(leaf);
        }
    });

    if (openLeaves.length > 0) {
        console.log(openLeaves[0])
        workspace.setActiveLeaf(openLeaves[0]);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mode = (app.vault as any).getConfig("defaultViewMode");
        const leaf = event.ctrlKey
            ? workspace.splitActiveLeaf()
            : workspace.getUnpinnedLeaf();
        await leaf.openFile(destFile, { active: true, mode });
    }
}