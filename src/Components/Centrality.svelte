<script lang='ts'>
    import type { Graph } from "graphlib";
    import type { App } from "obsidian";
    import * as Central from "src/Algorithms/Centrality";
    import type AnalysisView from "src/AnalysisView";
    import { currAlg } from "src/GeneralGraphFn";
    import type { GraphAnalysisSettings } from "src/Interfaces";
    import { debug,dropPath,hoverPreview,openOrSwitch } from "src/Utility";
    
    export let g: Graph;
    export let settings: GraphAnalysisSettings;
    export let app: App;
    export let view: AnalysisView;
    
    let currFile = app.workspace.getActiveFile()
    app.workspace.on('active-leaf-change', () => {
        currFile = app.workspace.getActiveFile()
    })

    let value = "Closeness";
    $: alg = currAlg(Central.CENTRALITY_TYPES, value)
    
    $: centralityArr = Central.centrailyForAll(alg, g);
    $: sortedCentrals = centralityArr.sort((a, b) => a.centrality > b.centrality ? -1 : 1)
    
    debug(settings, {sortedCentrals})
    
    const [noInfinityDefault, noZeroDefault] = [settings.noInfinity, settings.noZero];

    let noInfinity = noInfinityDefault;
    let noZero = noZeroDefault; 
        
</script>

<div>
    <span>Centrality Algorithm: 
        <select bind:value>
            {#each Central.CENTRALITY_TYPES as subtype}
                <option value={subtype.subtype}>{subtype.subtype}</option>
            {/each}
        </select>
    </span>

    <span>Exclude Infinity: 
        <input type="checkbox" 
            checked={noInfinity} 
            on:change={() => noInfinity = !noInfinity}>
    </span>

    <span>Exclude Zero: 
        <input type="checkbox" 
            checked={noZero} 
            on:change={() => noZero = !noZero}>
    </span>
</div>

    <table class="graph-analysis-table markdown-preview-view">
        <thead>
            <tr>
                <th scope="col">Note</th>
                <th scope="col">Centrality</th>
            </tr>
        </thead>
        {#each sortedCentrals as node}
                {#if node !== undefined && !(noInfinity && node.centrality === Infinity) && !(noZero && node.centrality === 0)}
                    <tr>
                        <td
                        class="internal-link"
                        on:click={(e) => openOrSwitch(app, node.a, currFile, e)}
                        on:mouseover={(e) => hoverPreview(e, view)}
                        >
                            {dropPath(node.a)}
                        </td>
                        <td>{node.centrality}</td>
                    </tr>
                {/if}
        {/each}
    </table>
    
    <style>
    
    </style>