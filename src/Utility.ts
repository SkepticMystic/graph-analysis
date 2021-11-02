import { App, EditorRange, MarkdownView, Menu, Notice, TFile } from 'obsidian'
import type AnalysisView from 'src/AnalysisView'
import { DECIMALS } from 'src/constants'
import type { GraphAnalysisSettings } from 'src/Interfaces'

export const sum = (arr: number[]) => {
  if (arr.length === 0) {
    return 0
  }
  return arr.reduce((a, b) => a + b)
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

export function roundNumber(num: number, dec: number = DECIMALS): number {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec)
}

export const dropPath = (path: string) => {
  return path.split('/').last()
}

export const nxnArray = (n: number): undefined[][] =>
  [...Array(n)].map((e) => Array(n))

// export function hoverPreview(
//   event: MouseEvent,
//   view: AnalysisView,
//   to?: string
// ): void {
//   const targetEl = event.target as HTMLElement
//   let linkText = to
//   if (!linkText) {
//     linkText = targetEl.innerText
//   }

//   view.app.workspace.trigger('hover-link', {
//     event,
//     source: view.getViewType(),
//     hoverParent: view,
//     targetEl,
//     linkText,
//   })
// }

export function hoverPreview(
  event: MouseEvent,
  view: AnalysisView,
  to: string
): void {
  const targetEl = event.target as HTMLElement

  view.app.workspace.trigger('hover-link', {
    event,
    source: view.getViewType(),
    hoverParent: view,
    targetEl,
    linktext: to,
  })
}

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
    new Notice('Metaedit must be enabled for this function to work')
    return
  }
  let valueStr = value.toString()
  const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter
  if (!frontmatter || frontmatter[key] === undefined) {
    await api.createYamlProperty(key, `['${valueStr}']`, file)
  } else if ([...[frontmatter[key]]].flat(3).some((val) => val == valueStr)) {
    return
  } else {
    const oldValueFlat: string[] = [...[frontmatter[key]]].flat(4)
    const newValue = [...oldValueFlat, valueStr].map((val) => `'${val}'`)
    await api.update(key, `[${newValue.join(', ')}]`, file)
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
          // @ts-ignore
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
        // @ts-ignore
        const targetStr = target.innerText
        const targetFile = app.metadataCache.getFirstLinkpathDest(targetStr, '')
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

export function jumpToSelection(app: App, line: number, sentence: string) {
  console.log({ line, sentence })
  const view = app.workspace.getActiveViewOfType(MarkdownView)
  // Make sure the user is editing a Markdown file.
  if (view && view.getMode() === 'source') {
    const { editor } = view

    // Creat sel
    const lineStartPos = { ch: 0, line }
    const markStart = editor.posToOffset(lineStartPos)

    // const lineStr = editor.getLine(line)
    // let startOfSentenceInLine = 0
    // if (lineStr !== sentence) {
    //   startOfSentenceInLine = lineStr.indexOf(sentence)
    // }

    // if (startOfSentenceInLine === -1) {
    //   console.log('sentence not in lineStr')
    //   return
    // }

    const markEnd = markStart + sentence.length

    const markSel: EditorRange = {
      from: editor.offsetToPos(markStart),
      to: editor.offsetToPos(markEnd),
    }

    editor.scrollIntoView(markSel)

    const doc = editor.cm.getDoc()
    const marker = doc.markText(markSel.from, markSel.to, {
      className: 'GA-highlight-sentence',
    })

    setTimeout(() => {
      marker.clear()
    }, 1000)
  } else if (view && view.getMode() === 'preview') {
    // Handle preview mode
  }
}
