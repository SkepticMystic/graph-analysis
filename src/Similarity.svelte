<script lang='ts'>
import type { Graph } from "graphlib";
import * as Sim from "src/Algorithms/Similarity";
import type { GraphAnalysisSettings } from "src/Interfaces";
import { debug } from "src/Utility";



export let g: Graph;
export let settings: GraphAnalysisSettings

const simArr = Sim.similaritiesForAll(Sim.adamicAdarSimilarity, g);
const sortedSim = simArr.sort((a, b) => a.similarity > b.similarity ? -1 : 1)

debug(settings, {simArr})
    
</script>

<table class="graph-analysis-table">
    <thead>
        <tr>
            <th scope="col">Note 1</th>
            <th scope="col">Note 2</th>
            <th scope="col">Similarity</th>
        </tr>
    </thead>
    {#each sortedSim as node}
        {#if node !== undefined}
            <tr>
                <td>{node.node1}</td>
                <td>{node.node2}</td>
                <td>{node.similarity}</td>
            </tr>
        {/if}
    {/each}
</table>

<style>

</style>