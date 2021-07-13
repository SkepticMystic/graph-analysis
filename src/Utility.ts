import type { App, ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { DECIMALS } from 'src/Constants';
import type { GraphAnalysisSettings } from "src/Interfaces";

export const sum = (arr: number[]) => {
    if (arr.length === 0) { return 0 }
    return arr.reduce((a, b) => a + b);
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

export const dropPath = (path: string) => {
    return path.split('/').last();
    // return last.replace(/\.[^/.]+$/, "")
}

export function linkedQ(app: App, from: string, to: string) {
    return app.metadataCache.resolvedLinks[from]?.hasOwnProperty(to);
}