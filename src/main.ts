import { Plugin, WorkspaceLeaf } from 'obsidian';
import AnalysisView from 'src/AnalysisView';
import { DEFAULT_SETTINGS, VIEW_TYPE_GRAPH_ANALYSIS } from "src/Constants";
import type { GraphAnalysisSettings } from 'src/Interfaces';
import MyGraph from 'src/MyGraph';
import { SampleSettingTab } from 'src/Settings';


export default class GraphAnalysisPlugin extends Plugin {
	settings: GraphAnalysisSettings;
	view: AnalysisView
	g: MyGraph

	async onload() {
		console.log('loading graph analysis plugin');

		await this.loadSettings();


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


		this.app.workspace.onLayoutReady(() => {
			setTimeout(() => {
				console.time('Initialise Graph')
				const { resolvedLinks } = this.app.metadataCache;
				this.g = new MyGraph(resolvedLinks, this.app);
				this.g.initGraph();
				this.g.initData();
				console.log({ g: this.g })
				console.timeEnd('Initialise Graph')

			}, 2000)
			setTimeout(() => {
				this.registerView(
					VIEW_TYPE_GRAPH_ANALYSIS,
					(leaf: WorkspaceLeaf) => (this.view = new AnalysisView(leaf, this))
				);
				this.initView(VIEW_TYPE_GRAPH_ANALYSIS);
			}, 3000)
		})

		this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
			// const currNode = this.app.workspace.getActiveFile().path.split('.md', 1)[0]
			// for(let node of this.g.nodes()) {
			// 	this.g.getData()
			// }
		}))


	}

	onunload() {
		console.log('unloading graph analysis plugin');
		const openLeaves = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_GRAPH_ANALYSIS
		);
		openLeaves.forEach((leaf) => leaf.detach());
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