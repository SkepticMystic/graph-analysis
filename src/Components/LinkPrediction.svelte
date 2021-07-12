<script lang='ts'>
import type { Graph } from "graphlib";
import type { App } from "obsidian";
import * as LP from "src/Algorithms/LinkPrediction";
import type AnalysisView from "src/AnalysisView";
import type { GraphAnalysisSettings } from "src/Interfaces";
import { debug,hoverPreview,openOrSwitch } from "src/Utility";





export let app: App;
export let g: Graph;
export let settings: GraphAnalysisSettings;
export let view: AnalysisView;

const currFile = app.workspace.getActiveFile()

let value = "Adamic Adar";
$: alg = LP.LINK_PREDICTION_TYPES.filter(subtype => subtype.subtype === value)[0].alg

$: predictionArr = LP.linkPredictionsForAll(alg, g);
$: sortedPredictions = predictionArr.sort((a, b) => a.prediction > b.prediction ? -1 : 1)

debug(settings, {predictionArr})
    
let noInfinity = false;


    
</script>

<div>
    <span>Link Prediction Algorithm: 
        <select bind:value>
            {#each LP.LINK_PREDICTION_TYPES as subtype}
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
            <th scope="col">Prediction</th>
        </tr>
    </thead>
    {#each sortedPredictions as node}
        {#if node !== undefined && !(noInfinity && node.prediction === Infinity)}
            <tr>
                <td class="internal-link"
                    on:click={(e) => openOrSwitch(app, node.a, currFile, e)}
                    on:mouseover={(e) => hoverPreview(e, view)}
                >{node.a}
                </td>
                <td class="internal-link"
                    on:click={(e) => openOrSwitch(app, node.b, currFile, e)}
                    on:mouseover={(e) => hoverPreview(e, view)}
                >{node.b}
                </td>
                <td>{node.prediction}</td>
            </tr>
        {/if}
    {/each}
</table>

<style>

</style>