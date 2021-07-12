<script lang='ts'>
    import type { Graph } from "graphlib";
    import type { App } from "obsidian";
    import * as Sim from "src/Algorithms/Similarity";
    import type AnalysisView from "src/AnalysisView";
    import type { GraphAnalysisSettings } from "src/Interfaces";
    import { currAlg,debug,hoverPreview,openOrSwitch } from "src/Utility";

    
    export let app: App;
    export let g: Graph;
    export let settings: GraphAnalysisSettings;
    export let view: AnalysisView;
    
    let currFile = app.workspace.getActiveFile();
    let currNode = currFile.path.split('.md', 1)[0];
    app.workspace.on('active-leaf-change', () => {
        currFile = app.workspace.getActiveFile();
        currNode = currFile.path.split('.md', 1)[0];
    })
    
    let value = "Node Similarity";
    
    $: alg = currAlg(Sim.SIMILARITY_TYPES, value)
    
    $: similarityArr = alg(g, currNode);
    $: sortedSimilarities = similarityArr.sort((a, b) => a.similarity > b.similarity ? -1 : 1)
    
    debug(settings, {similarityArr})
        
    let noInfinity = false;
    
    
        
    </script>
    
    <div>
        <span>Similarity Algorithm: 
            <select bind:value>
                {#each Sim.SIMILARITY_TYPES as subtype}
                    <option value={subtype.subtype}>{subtype.subtype}</option>
                {/each}
            </select>
        </span>
        <span>Exclude Infinity: <input type="checkbox" on:change={() => noInfinity = !noInfinity}></span>
    </div>
    
    
    <table class="graph-analysis-table markdown-preview-view">
        <thead>
            <tr>
                <th scope="col">Note</th>
                <th scope="col">Similarity</th>
            </tr>
        </thead>
        {#each sortedSimilarities as node}
            {#if node !== undefined && !(noInfinity && node.similarity === Infinity)}
                <tr>
                    <td class="internal-link"
                        on:click={(e) => openOrSwitch(app, node.a, currFile, e)}
                        on:mouseover={(e) => hoverPreview(e, view)}
                    >{node.a}
                    </td>
                    <td>{node.similarity}</td>
                </tr>
            {/if}
        {/each}
    </table>
    
    <style>
    
    </style>