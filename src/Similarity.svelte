<script lang='ts'>
import type { Graph } from "graphlib";
import * as Sim from "src/Algorithms/Similarity";


export let g: Graph;

const simArr = Sim.similaritiesForAll(Sim.adamicAdarSimilarity, g);

const sortedSim = simArr.sort((a, b) => a.similarity > b.similarity ? -1 : 1)

console.log({simArr})
    
</script>

<table>
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
table, td {
    border: 1px solid black;
}
</style>