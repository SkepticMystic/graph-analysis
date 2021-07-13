import { Graph } from "graphlib";
import type { App, ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { DECIMALS } from 'src/Constants';
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
    workspace.iterateAllLeaves((leaf) => {
        if (leaf.view?.file?.basename === dest) {
            openLeaves.push(leaf);
        }
    });

    if (openLeaves.length > 0) {
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

export function roundNumber(num: number, dec: number = DECIMALS): number {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

export function currAlg<T>(types: { subtype: string, alg: T }[], value: string) {
    return types.filter(subtype => subtype.subtype === value)[0].alg
}

export const dropPath = (path: string) => {
    return path.split('/').last();
    // return last.replace(/\.[^/.]+$/, "")
}