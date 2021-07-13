<script lang='ts'>
    import type { Graph } from "graphlib";
    import type { App } from "obsidian";
    import * as Sim from "src/Algorithms/Similarity";
    import type AnalysisView from "src/AnalysisView";
    import { LINKED,NOT_LINKED } from "src/Constants";
    import { currAlg } from "src/GeneralGraphFn";
    import type { GraphAnalysisSettings } from "src/Interfaces";
    import { debug,dropPath,hoverPreview,linkedQ,openOrSwitch } from "src/Utility";



    
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
        

    const [noInfinityDefault, noZeroDefault] = [settings.noInfinity, settings.noZero];
    console.log({noInfinityDefault, noZeroDefault})

    let noInfinity = noInfinityDefault;
    let noZero = noZeroDefault;    
        
    </script>
    
    <div>
        <span>Similarity Algorithm: 
            <select bind:value>
                {#each Sim.SIMILARITY_TYPES as subtype}
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
                <th scope="col">Similarity</th>
            </tr>
        </thead>
        {#each sortedSimilarities as node}
            {#if node !== undefined && !(noInfinity && node.similarity === Infinity) && !(noZero && node.similarity === 0)}
                <tr>
                    <td class="internal-link {linkedQ(app, currFile.path, node.a + '.md') ? LINKED : NOT_LINKED}"
                        on:click={(e) => openOrSwitch(app, node.a, currFile, e)}
                        on:mouseover={(e) => hoverPreview(e, view)}
                    >
                        {dropPath(node.a)}
                    </td>
                    <td>{node.similarity}</td>
                </tr>
            {/if}
        {/each}
    </table>
    
    <style>
    
    </style>