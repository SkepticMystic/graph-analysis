<script lang='ts'>
    import type { Graph } from "graphlib";
    import * as Central from "src/Algorithms/Centrality";
    import type { Centrality } from "src/Interfaces";

    
    
    export let g: Graph;
    
    const centralArr: Centrality[] = Central.closenessCentrality(g)
    
    const sortedCentral = centralArr.sort((a, b) => a.centrality > b.centrality ? -1 : 1)
    
    console.log({sortedCentral})
        
</script>
    
    <table class="graph-analysis-table">
        <thead>
            <tr>
                <th scope="col">Note</th>
                <th scope="col">Centrality</th>
            </tr>
        </thead>
        {#each sortedCentral as node}
            {#if node !== undefined}
            <tr>
                <td>{node.node}</td>
                <td>{node.centrality}</td>
            </tr>
            {/if}
        {/each}
    </table>
    
    <style>
    
    </style>