<script lang='ts'>
import type { Graph } from "graphlib";
import type { App } from "obsidian";
import * as LP from "src/Algorithms/LinkPrediction";
import type AnalysisView from "src/AnalysisView";
import { LINKED,NOT_LINKED } from "src/Constants";
import { currAlg } from "src/GeneralGraphFn";
import type { GraphAnalysisSettings } from "src/Interfaces";
import { debug,dropPath,hoverPreview,linkedQ,openOrSwitch } from "src/Utility";



export let app: App;
export let g: Graph;
export let settings: GraphAnalysisSettings;
export let view: AnalysisView;

let currFile = app.workspace.getActiveFile()
app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
})

let value = "Adamic Adar";
$: alg = currAlg(LP.LINK_PREDICTION_TYPES, value)

$: predictionArr = LP.linkPredictionsForAll(alg, g, currFile.path.split('.md', 1)[0]);
$: sortedPredictions = predictionArr.sort((a, b) => a.prediction > b.prediction ? -1 : 1)

debug(settings, {predictionArr})
    
    const [noInfinityDefault, noZeroDefault] = [settings.noInfinity, settings.noZero];

    let noInfinity = noInfinityDefault;
    let noZero = noZeroDefault; 
    
</script>

<div>
    <span>Link Prediction Algorithm: 
        <select bind:value>
            {#each LP.LINK_PREDICTION_TYPES as subtype}
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
            <th scope="col">Note 1</th>
            <th scope="col">Prediction</th>
        </tr>
    </thead>
    {#each sortedPredictions as node}
        {#if node !== undefined && !(noInfinity && node.prediction === Infinity) && !(noZero && node.prediction === 0)}
            <tr>
                <td class="internal-link {linkedQ(app, currFile.path, node.a + '.md') ? LINKED : NOT_LINKED}"
                    on:click={(e) => openOrSwitch(app, node.a, currFile, e)}
                    on:mouseover={(e) => hoverPreview(e, view)}
                >
                    {dropPath(node.a)}
                </td>
                <td>{node.prediction}</td>
            </tr>
        {/if}
    {/each}
</table>

<style>

</style>