<script lang='ts'>
    import type { Graph } from "graphlib";
    import type { App } from "obsidian";
    import * as Central from "src/Algorithms/Centrality";
    import type AnalysisView from "src/AnalysisView";
    import type { CentralityObj,GraphAnalysisSettings } from "src/Interfaces";
    import { hoverPreview,openOrSwitch } from "src/Utility";


    
    export let g: Graph;
    export let settings: GraphAnalysisSettings;
    export let app: App;
    export let view: AnalysisView;
    
    const currFile = app.workspace.getActiveFile()

    const centralArr: CentralityObj[] = Central.closenessCentrality(g)
    const sortedCentral = centralArr.sort((a, b) => a.centrality > b.centrality ? -1 : 1)
    
    console.log({sortedCentral});
    
    let noInfinity = false;
        
</script>

    <span>Exclude Infinity: <input type="checkbox" on:change={() => noInfinity = !noInfinity}></span>


    <table class="graph-analysis-table markdown-preview-view">
        <thead>
            <tr>
                <th scope="col">Note</th>
                <th scope="col">Centrality</th>
            </tr>
        </thead>
        {#each sortedCentral as node}
                {#if node !== undefined && !(noInfinity && node.centrality === Infinity)}
                    <tr>
                        <td
                        class="internal-link"
                        on:click={(e) => openOrSwitch(app, node.a, currFile, e)}
                        on:mouseover={(e) => hoverPreview(e, view)}
                        >
                            {node.a}
                        </td>
                        <td>{node.centrality}</td>
                    </tr>
                {/if}
        {/each}
    </table>
    
    <style>
    
    </style>