import { App, ItemView, Menu, Notice, TFile, WorkspaceLeaf } from "obsidian";
import { DECIMALS } from 'src/Constants';
import type { GraphAnalysisSettings, ResolvedLinks } from "src/Interfaces";

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

// export async function openOrSwitch(
//     app: App,
//     dest: string,
//     currFile: TFile,
//     event: MouseEvent,
// ): Promise<void> {
//     const { workspace } = app;
//     const destFile = app.metadataCache.getFirstLinkpathDest(dest, currFile.path);

//     const openLeaves: WorkspaceLeaf[] = [];
//     workspace.iterateAllLeaves((leaf) => {
//         if (leaf.view?.file?.basename === dest) {
//             openLeaves.push(leaf);
//         }
//     });

//     if (openLeaves.length > 0) {
//         workspace.setActiveLeaf(openLeaves[0]);
//     } else {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const mode = (app.vault as any).getConfig("defaultViewMode");
//         const leaf = event.ctrlKey
//             ? workspace.splitActiveLeaf()
//             : workspace.getUnpinnedLeaf();
//         await leaf.openFile(destFile, { active: true, mode });
//     }
// }

export async function openOrSwitch(
    app: App,
    // plugin: GraphAnalysisPlugin,
    // lineObj: {} | null,
    dest: string,
    currFile: TFile,
    event: MouseEvent
): Promise<void> {
    const { workspace } = app;
    let destFile = app.metadataCache.getFirstLinkpathDest(dest, currFile.path);

    // If dest doesn't exist, make it
    if (!destFile) {
        const newFileFolder = app.fileManager.getNewFileParent(currFile.path).path;
        const newFilePath = `${newFileFolder}${newFileFolder === "/" ? "" : "/"}${dest}.md`;
        await app.vault.create(newFilePath, "");
        destFile = app.metadataCache.getFirstLinkpathDest(
            newFilePath,
            currFile.path
        );
    }

    // Check if it's already open
    const leavesWithDestAlreadyOpen: WorkspaceLeaf[] = [];
    // For all open leaves, if the leave's basename is equal to the link destination, rather activate that leaf instead of opening it in two panes
    workspace.iterateAllLeaves((leaf) => {
        if (leaf.view?.file?.basename === dest) {
            leavesWithDestAlreadyOpen.push(leaf);
        }
    });

    // Rather switch to it if it is open
    if (leavesWithDestAlreadyOpen.length > 0) {
        workspace.setActiveLeaf(leavesWithDestAlreadyOpen[0]);
    } else {
        const mode = (app.vault as any).getConfig("defaultViewMode");
        const leaf = (event.ctrlKey || event.getModifierState('Meta'))
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

export function linkedQ(resolvedLinks: ResolvedLinks, from: string, to: string) {
    if (!from.endsWith('.md')) { from += '.md' }
    if (!to.endsWith('.md')) { to += '.md' }
    return resolvedLinks[from]?.hasOwnProperty(to);
}

export const nxnArray = (n: number): undefined[][] => [...Array(n)].map(e => Array(n))

/**
 * Adds or updates the given yaml `key` to `value` in the given TFile
 * @param  {string} key
 * @param  {string} value
 * @param  {TFile} file
 * @param  {App} app
 */
export const createOrUpdateYaml = async (
    key: string,
    value: string,
    file: TFile,
    app: App
) => {
    // @ts-ignore
    const api = app.plugins.plugins.metaedit?.api

    if (!api) {
        new Notice('Metaedit must be enabled for this function to work');
        return
    }
    let valueStr = value.toString()
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    console.log({ api, frontmatter })
    if (!frontmatter || frontmatter[key] === undefined) {
        console.log(`Creating: ${key}: ${valueStr}`)
        await api.createYamlProperty(key, `['${valueStr}']`, file);
    } else if ([...[frontmatter[key]]].flat(3).some(val => val == valueStr)) {
        console.log('Already Exists!')
        return
    }
    else {
        const oldValueFlat: string[] = [...[frontmatter[key]]].flat(4);
        const newValue = [...oldValueFlat, valueStr].map(val => `'${val}'`);
        console.log(`Updating: ${key}: ${newValue}`)
        await api.update(key, `[${newValue.join(", ")}]`, file);
    }

}

export function openMenu(event: MouseEvent, app: App) {
    const tdEl = event.target
    const menu = new Menu(app)
    menu.addItem((item) =>
        item
            .setTitle('Create Link: Current')
            .setIcon('documents')
            .onClick((e) => {
                try {
                    const currFile = app.workspace.getActiveFile()
                    const targetStr = tdEl.innerText
                    createOrUpdateYaml('key', targetStr, currFile, app)

                    new Notice('Write Successful')
                } catch (error) {
                    new Notice('Write failed')
                }
            })
    )

    menu.addItem((item) =>
        item
            .setTitle('Create Link: Target')
            .setIcon('documents')
            .onClick((e) => {
                const currStr = app.workspace.getActiveFile().basename

                const { target } = event
                const targetStr = target.innerText
                const targetFile = app.metadataCache.getFirstLinkpathDest(
                    targetStr,
                    ''
                )
                if (!targetFile) {
                    new Notice(`${targetStr} does not exist in your vault yet`)
                    return
                } else {
                    createOrUpdateYaml('key', currStr, targetFile, app)
                }
            })
    )
    menu.showAtMouseEvent(event)
}