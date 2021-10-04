<script lang="ts">
import type { Graph } from "graphlib";
import Similarity from "./Similarity.svelte"


export let g: Graph;

$: analysisType = 'closeness';
$: console.log(analysisType)
</script>

<label for="Algorithm">Choose an analysis type:</label>
  <select id="Algorithm" name="cars" on:blur={(e) => analysisType = e.value}>
    <option value="closeness">Closeness</option>
    <option value="similarity">Similarity</option>
  </select>