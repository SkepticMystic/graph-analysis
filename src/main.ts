import { Plugin, WorkspaceLeaf } from 'obsidian';
import { adamicAdarSimilarity, similaritiesForAll } from 'src/Algorithms/Similarity';
import AnalysisView from 'src/AnalysisView';
import { DEFAULT_SETTINGS, VIEW_TYPE_GRAPH_ANALYSIS } from "src/Constants";
import type { GraphAnalysisSettings } from 'src/Interfaces';
import { SampleSettingTab } from 'src/Settings';
import { initGraph } from 'src/Utility';




export default class GraphAnalysisPlugin extends Plugin {
	settings: GraphAnalysisSettings;
	view: AnalysisView

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addRibbonIcon('dice', 'Console Log Closeness', () => {
			console.log(similaritiesForAll(adamicAdarSimilarity, initGraph(this.app)));
		});

		this.addCommand({
			id: "show-graph-analysis-view",
			name: "Open Graph Analysis View",
			checkCallback: (checking: boolean) => {
				if (checking) {
					return (
						this.app.workspace.getLeavesOfType(VIEW_TYPE_GRAPH_ANALYSIS)
							.length === 0
					);
				}
				this.initView(VIEW_TYPE_GRAPH_ANALYSIS);
			},
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});

		this.registerView(
			VIEW_TYPE_GRAPH_ANALYSIS,
			(leaf: WorkspaceLeaf) => (this.view = new AnalysisView(leaf, this))
		);
	}

	sum = (arr: number[]) => arr.reduce((a, b) => a + b);



	onunload() {
		console.log('unloading plugin');
	}

	initView = async (type: string): Promise<void> => {
		let leaf: WorkspaceLeaf = null;
		for (leaf of this.app.workspace.getLeavesOfType(type)) {
			if (leaf.view instanceof AnalysisView) {
				return;
			}
			await leaf.setViewState({ type: "empty" });
			break;
		}
		(leaf ?? this.app.workspace.getRightLeaf(false)).setViewState({
			type,
			active: true,
		});
	};

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}