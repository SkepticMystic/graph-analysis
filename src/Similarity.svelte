<script lang='ts'>
import type { Graph } from "graphlib";
import type { App } from "obsidian";
import { SIMILARITY_TYPES } from "src/Constants";
import * as Sim from "src/Algorithms/Similarity";
import type AnalysisView from "src/AnalysisView";
import type { GraphAnalysisSettings } from "src/Interfaces";
import { debug,hoverPreview,openOrSwitch } from "src/Utility";


export let app: App;
export let g: Graph;
export let settings: GraphAnalysisSettings;
export let view: AnalysisView;

const currFile = app.workspace.getActiveFile()

let value = "Adamic Adar";
$: alg = SIMILARITY_TYPES.filter(subtype => subtype.subtype === value)[0].alg

$: simArr = Sim.similaritiesForAll(alg, g);
$: sortedSim = simArr.sort((a, b) => a.similarity > b.similarity ? -1 : 1)

debug(settings, {simArr})
    
let noInfinity = false;


    
</script>

<div>
    <span>Similarity Algorithm: 
        <select bind:value>
            {#each SIMILARITY_TYPES as subtype}
                <option value={subtype.subtype}>{subtype.subtype}</option>
            {/each}
        </select>
    </span>
    <span>Exclude Infinity: <input type="checkbox" on:change={() => noInfinity = !noInfinity}></span>
</div>


<table class="graph-analysis-table markdown-preview-view">
    <thead>
        <tr>
            <th scope="col">Note 1</th>
            <th scope="col">Note 2</th>
            <th scope="col">Similarity</th>
        </tr>
    </thead>
    {#each sortedSim as node}
        {#if node !== undefined && !(noInfinity && node.similarity === Infinity)}
            <tr>
                <td class="internal-link"
                    on:click={(e) => openOrSwitch(app, node.node1, currFile, e)}
                    on:mouseover={(e) => hoverPreview(e, view)}
                >{node.node1}
                </td>
                <td class="internal-link"
                    on:click={(e) => openOrSwitch(app, node.node2, currFile, e)}
                    on:mouseover={(e) => hoverPreview(e, view)}
                >{node.node2}
                </td>
                <td>{node.similarity}</td>
            </tr>
        {/if}
    {/each}
</table>

<style>

</style>