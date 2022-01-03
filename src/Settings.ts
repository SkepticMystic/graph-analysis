import { App, Notice, PluginSettingTab, Setting } from 'obsidian'
import { ANALYSIS_TYPES } from 'src/Constants'
import type { Subtype } from 'src/Interfaces'
import type GraphAnalysisPlugin from 'src/main'
import Checkboxes from './Components/Checkboxes.svelte'

export class SampleSettingTab extends PluginSettingTab {
  plugin: GraphAnalysisPlugin

  constructor(app: App, plugin: GraphAnalysisPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const plugin = this.plugin
    let { containerEl } = this
    const { settings } = plugin

    containerEl.empty()

    containerEl.createEl('h3', { text: 'Analysis Defaults' })

    new Setting(containerEl)
      .setName('Default Analysis Type')
      .setDesc('Which analysis type to show on startup')
      .addDropdown((dd) => {
        dd.setValue(settings.defaultSubtypeType)
        const dict = {}
        settings.algsToShow.forEach((subtype) => {
          dict[subtype] = subtype
        })
        dd.addOptions(dict).onChange(async (option) => {
          settings.defaultSubtypeType = option as Subtype
          await plugin.saveSettings()
        })
      })

    containerEl.createEl('h3', { text: 'Algorithms to Show' })
    new Checkboxes({
      target: containerEl,
      props: {
        options: ANALYSIS_TYPES.map((type) => type.subtype),
        plugin,
        settingName: 'algsToShow',
      },
    })

    new Setting(containerEl)
      .setName('Exclude Infinity')
      .setDesc('Whether to exclude Infinite values by default')
      .addToggle((toggle) =>
        toggle.setValue(settings.noInfinity).onChange(async (value) => {
          settings.noInfinity = value
          await plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Exclude Zero')
      .setDesc('Whether to exclude Zero by default')
      .addToggle((toggle) =>
        toggle.setValue(settings.noZero).onChange(async (value) => {
          settings.noZero = value
          await plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Include All File Extensions')
      .setDesc(
        'Whether to also show files with non-md extensions in the analyses.'
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.allFileExtensions).onChange(async (value) => {
          settings.allFileExtensions = value
          await plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Show Thumbnails for Images')
      .setDesc(
        'Whether to show small thumbnails for images (if all file extensions are included).'
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.showImgThumbnails).onChange(async (value) => {
          settings.showImgThumbnails = value
          await plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Include tags (Co-Citations)')
      .setDesc(
        'Whether to also show the tags that are co-cited in the co-citations algorithm.'
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.coTags).onChange(async (value) => {
          settings.coTags = value
          await plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Include Unresolved Links')
      .setDesc('Whether to also show links that have not yet been created.')
      .addToggle((toggle) =>
        toggle.setValue(settings.addUnresolved).onChange(async (value) => {
          settings.addUnresolved = value
          await plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Exclusion Tags')
      .setDesc(
        "A comma-separated list of tags. Any note with any of these tags won't be included in the graph. Include the `#` in each tag"
      )
      .addText((tc) => {
        tc.setValue(settings.exclusionTags.join(', '))
        tc.inputEl.onblur = async () => {
          const { value } = tc.inputEl
          const splits = value.split(',').map((s) => s.trim())
          if (value !== '' && !splits.every((t) => t.startsWith('#'))) {
            new Notice("Every tag must start with '#'")
            return
          }
          settings.exclusionTags = splits
          await plugin.saveSettings()
        }
      })

    new Setting(containerEl)
      .setName('Exclusion Regex')
      .setDesc(
        createFragment((el) => {
          el.createEl('p', {
            text: "Regex to exclude values from analysis. If a file name matches this regex, it won't be added to the graph.",
          })
          const span = el.createSpan()
          span.createSpan({ text: 'Default is ' })
          span.createEl('code', { text: '(?:)' })
          span.createSpan({ text: ' or ' })
          span.createEl('code', { text: "''" })
          span.createSpan({
            text: ' (empty string). Either option will allow all notes through the filter (regular Graph Anlaysis behaviour).',
          })

          el.createEl('p', {
            text: 'Remeber that the regex will be tested against the full file path of each note (not just the basename). So you may need to include "folders/" and ".md" for some regexes.',
          })
        })
      )
      .addText((textComp) => {
        textComp.setValue(settings.exclusionRegex)
        textComp.inputEl.onblur = async () => {
          const value = textComp.getValue()
          // Test if valid regex and save
          try {
            new RegExp(value)
            settings.exclusionRegex = value
            await plugin.saveSettings()
            await this.plugin.refreshGraph()
          } catch (e) {
            // Invalid regex
            new Notice(
              `${value} is not a valid regular expression. Make sure you have closed all brackets, and escaped any characters where necessary.`
            )
          }
        }
      })

    containerEl.createEl('h3', { text: 'Debugging Options' })

    new Setting(containerEl)
      .setName('Debug Mode')
      .setDesc(
        'Toggling this on will enable a few console logs to appear when using the graph analysis view.'
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.debugMode).onChange(async (value) => {
          settings.debugMode = value
          await plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Super Debug Mode')
      .setDesc('Toggling this on will enable ALOT of console logs')
      .addToggle((toggle) =>
        toggle.setValue(settings.superDebugMode).onChange(async (value) => {
          settings.superDebugMode = value
          await plugin.saveSettings()
        })
      )
  }
}
