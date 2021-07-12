<script lang='ts'>
import type { Graph } from "graphlib";
import type {Similarity} from "src/Interfaces"

import * as Sim from "src/Algorithms/Similarity"

export let g: Graph;

const simArr = Sim.similaritiesForAll(Sim.adamicAdarSimilarity, g);

console.log({simArr})
    
</script>

{#each simArr as node}
    {#if node !== undefined}
    <div>
        <span>{node.node1}</span>
        <span> & </span>
        <span>{node.node2}</span>
        <span> = </span>
        <span>{node.similarity}</span>
    </div>
    {/if}
{/each}

<style>

</style>