import { App, PluginSettingTab, Setting } from "obsidian";
import type { Analyses } from "src/Interfaces";
import { ANALYSIS_TYPES } from "src/Constants";
import type GraphAnalysisPlugin from "src/main";

export class SampleSettingTab extends PluginSettingTab {
    plugin: GraphAnalysisPlugin;

    constructor(app: App, plugin: GraphAnalysisPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const plugin = this.plugin
        let { containerEl } = this;
        const { settings } = plugin

        containerEl.empty();

        containerEl.createEl("h3", { text: "Analysis Defaults" });

        new Setting(containerEl)
            .setName("Default Analysis Type")
            .setDesc("Which analysis type to show on startup")
            .addDropdown(dd => {
                dd.setValue(settings.defaultAnalysisType)
                const dict = {}
                ANALYSIS_TYPES.forEach(type => {
                    dict[type] = type
                });
                dd.addOptions(dict).onChange(async option => {
                    settings.defaultAnalysisType = (option as Analyses)
                    await plugin.saveSettings()
                })
            })

        new Setting(containerEl)
            .setName("Exclude Infinity")
            .setDesc("Whether to exclude Infinite values by default")
            .addToggle((toggle) =>
                toggle
                    .setValue(settings.noInfinity)
                    .onChange(async (value) => {
                        settings.noInfinity = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Exclude Zero")
            .setDesc("Whether to exclude Zero by default")
            .addToggle((toggle) =>
                toggle
                    .setValue(settings.noZero)
                    .onChange(async (value) => {
                        settings.noZero = value;
                        await plugin.saveSettings();
                    })
            );


        containerEl.createEl("h3", { text: "Debugging Options" });

        new Setting(containerEl)
            .setName("Debug Mode")
            .setDesc(
                "Toggling this on will enable a few console logs to appear when using the graph analysis view."
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(settings.debugMode)
                    .onChange(async (value) => {
                        settings.debugMode = value;
                        await plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Super Debug Mode")
            .setDesc("Toggling this on will enable ALOT of console logs")
            .addToggle((toggle) =>
                toggle
                    .setValue(settings.superDebugMode)
                    .onChange(async (value) => {
                        settings.superDebugMode = value;
                        await plugin.saveSettings();
                    })
            );
    }
}