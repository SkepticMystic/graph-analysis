import { App, Notice, PluginSettingTab, Setting } from 'obsidian'
import { ANALYSES } from 'src/constants'
import type { Analyses } from 'src/Interfaces'
import type GraphAnalysisPlugin from 'src/main'

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
        dd.setValue(settings.defaultAnalysisType)
        const dict = {}
        ANALYSES.forEach((type) => {
          dict[type.anl] = type.anl
        })
        dd.addOptions(dict).onChange(async (option) => {
          settings.defaultAnalysisType = option as Analyses
          await plugin.saveSettings()
        })
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
            text: 'Remeber that the regex will be tested against the full file path of each note (not just the basename). So you may need to include "folders/" and "\.md" for some regexes.',
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
