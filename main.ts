import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as graphlib from 'graphlib';
import { Graph } from 'graphlib';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addRibbonIcon('dice', 'Console Log Closeness', () => {
			console.log(this.calcCloseness());
		});

		this.addCommand({
			id: 'open-sample-modal',
			name: 'Open Sample Modal',
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new SampleModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});
	}

	sum = (arr: number[]) => arr.reduce((a, b) => a + b);

	initGraph(): Graph {
		const { resolvedLinks } = this.app.metadataCache
		const g = new Graph();

		for (const source in resolvedLinks) {
			g.setNode(source);
			for (const dest in resolvedLinks[source]) {
				g.setEdge(source, dest);
			}
		}
		return g
	}

	calcCloseness() {
		const g = this.initGraph();

		const allPaths = graphlib.alg.dijkstraAll(g);

		const nodeCloseness: Record<string, number> = {};

		for (const source in allPaths) {
			const distances = [];

			for (const node in allPaths[source]) {
				const dist = allPaths[source][node].distance;
				if (dist < Infinity) {
					distances.push(dist);
				}
			}
			
			if (distances.length > 0) {
				nodeCloseness[source] = (g.nodes().length - 1) / this.sum(distances);
			} else {
				nodeCloseness[source] = 0
			}
		}
		return nodeCloseness;
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
