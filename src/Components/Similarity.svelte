<script lang="ts">
  import type { App } from 'obsidian'
  import { openOrSwitch } from 'obsidian-community-lib'
  import { SIMILARITY_TYPES } from 'src/Algorithms/Similarity'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/Constants'
  import type { GraphAnalysisSettings } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import { debug, dropPath, hoverPreview, linkedQ, openMenu } from 'src/Utility'
  import { onMount } from 'svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView

  let currFile = app.workspace.getActiveFile()
  $: currNode = currFile.path.split('.md', 1)[0]
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let resolvedLinks = app.metadataCache.resolvedLinks
  $: subtype = 'Jaccard'
  $: promiseSortedSimilarities = plugin.g
    .getData(subtype, currNode)
    .then((measures) =>
      plugin.g
        .nodes()
        .map((to) => {
          const i = plugin.g.node(to)
          return {
            measure: measures[i],
            linked: linkedQ(resolvedLinks, currNode, to),
            to,
          }
        })
        .sort((a, b) => (a.measure > b.measure ? -1 : 1))
    )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    let subtype = 'Jaccard'
    debug(settings, { promiseSortedSimilarities })
  })

  let { noInfinity, noZero } = settings
  //   let [noInfinity, noZero] = [settings.noInfinity, settings.noZero]
</script>

<div>
  <label for="Alg">Alg:</label>
  <select bind:value={subtype} name="Alg" class="dropdown GA-DD">
    {#each SIMILARITY_TYPES as subtype}
      <option value={subtype.subtype}>{subtype.subtype}</option>
    {/each}
  </select>

  <label for="Infinity">Infinity?</label>
  <input
    name="Infinity"
    type="checkbox"
    checked={noInfinity}
    on:change={() => (noInfinity = !noInfinity)}
  />

  <label for="Zero">Zero?</label>
  <input
    name="Zero"
    type="checkbox"
    checked={noZero}
    on:change={() => (noZero = !noZero)}
  />
</div>

<table class="graph-analysis-table markdown-preview-view">
  <thead>
    <tr>
      <th scope="col">Note</th>
      <th scope="col">Similarity</th>
    </tr>
  </thead>
  {#await promiseSortedSimilarities then sortedSimilarities}
    {#each sortedSimilarities as node}
      {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
        <tr class={node.linked ? LINKED : NOT_LINKED}>
          <td
            class="internal-link {TD_NODE}"
            on:click={(e) => {
              openOrSwitch(app, node.to, e)
            }}
            on:contextmenu={(e) => {
              openMenu(e, app)
            }}
            on:mouseover={(e) => hoverPreview(e, view)}
          >
            {dropPath(node.to)}
          </td>
          <td class={TD_MEASURE}>{node.measure}</td>
        </tr>
      {/if}
    {/each}
  {/await}
</table>

<style>
</style>
