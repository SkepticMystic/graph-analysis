<script lang='ts'>
    import type { Graph } from "graphlib";
    import type { App } from "obsidian";
    import * as Central from "src/Algorithms/Centrality";
    import type AnalysisView from "src/AnalysisView";
    import { LINKED,NOT_LINKED,TD_MEASURE,TD_NODE } from "src/Constants";
    import { currAlg } from "src/GeneralGraphFn";
    import type { GraphAnalysisSettings, ResolvedLinks } from "src/Interfaces";
    import { debug,dropPath,hoverPreview,linkedQ,openOrSwitch } from "src/Utility";


    
    export let g: Graph;
    export let settings: GraphAnalysisSettings;
    export let app: App;
    export let view: AnalysisView;
    export let resolvedLinks: ResolvedLinks;

    let currFile = app.workspace.getActiveFile()
    app.workspace.on('active-leaf-change', () => {
        currFile = app.workspace.getActiveFile()
    })
    $: currNode = currFile.path.split('.md', 1)[0];


    let value = "Closeness";
    $: alg = currAlg(Central.CENTRALITY_TYPES, value)
    
    $: centralityArr = Central.centralityForAll(alg, g, currNode, resolvedLinks);
    $: sortedCentrals = centralityArr.sort((a, b) => a.measure > b.measure ? -1 : 1)
    
    debug(settings, {sortedCentrals})

    let [noInfinity, noZero] = [settings.noInfinity, settings.noZero]; 
        
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
                {#if node !== undefined 
                    && !(noInfinity && node.measure === Infinity) 
                    && !(noZero && node.measure === 0)}
                    <tr class={node.linked ? LINKED : NOT_LINKED}>
                        <td
                        class="internal-link {TD_NODE}"
                        on:click={(e) => openOrSwitch(app, node.to, currFile, e)}
                        on:mouseover={(e) => hoverPreview(e, view)}
                        >
                            {dropPath(node.to)}
                        </td>
                        <td
                        class="internal-link {TD_MEASURE}"
                        >{node.measure}</td>
                    </tr>
                {/if}
        {/each}
    </table>
    
    <style>
    
    </style>