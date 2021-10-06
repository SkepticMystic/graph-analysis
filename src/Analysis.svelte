<script lang="ts">
  import type MyGraph from 'src/MyGraph'

  export let g: MyGraph

  $: analysisType = 'closeness'
</script>

<label for="Algorithm">Choose an analysis type:</label>
<select id="Algorithm" name="cars" on:blur={(e) => (analysisType = e.value)}>
  <option value="closeness">Closeness</option>
  <option value="similarity">Similarity</option>
</select>
