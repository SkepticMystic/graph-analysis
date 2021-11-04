<script lang="ts">
  import type { App } from 'obsidian'
  import { openOrSwitch } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import {
    LINKED,
    NOT_LINKED,
    SIMILARITY_TYPES,
    TD_MEASURE,
    TD_NODE,
  } from 'src/constants'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    debug,
    hoverPreview,
    dropPath,
    openMenu,
    getPromiseResults,
  } from 'src/Utility'
  import { onMount } from 'svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView

  let subtype: Subtype = 'Jaccard'
  let currFile = app.workspace.getActiveFile()
  $: currNode = currFile?.path.split('.md', 1)[0]
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let { resolvedLinks } = app.metadataCache
  // $: subtype = 'Jaccard'
  $: promiseSortedSimilarities = getPromiseResults(
    plugin,
    currNode,
    subtype,
    resolvedLinks
  )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    subtype = 'Jaccard'
    debug(settings, { promiseSortedSimilarities })
  })

  let { noInfinity, noZero } = settings
</script>

<div>
  <label for="Alg">Alg:</label>
  <select bind:value={subtype} name="Alg" class="dropdown GA-DD">
    {#each SIMILARITY_TYPES as subtype}
      <option value={subtype.subtype}>{subtype.subtype}</option>
    {/each}
  </select>

  <label for="Infinity">∞?</label>
  <input
    name="Infinity"
    type="checkbox"
    checked={noInfinity}
    on:change={() => (noInfinity = !noInfinity)}
  />

  <label for="Zero">0?</label>
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
      <th scope="col">Measure</th>
    </tr>
  </thead>
  {#if promiseSortedSimilarities}
    {#await promiseSortedSimilarities then sortedSimilarities}
      {#each sortedSimilarities as node}
        {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
          <tr
            class={node.linked ? LINKED : NOT_LINKED}
            aria-label={node.extra.map(dropPath).join('\n')}
            aria-label-position="left"
          >
            <td
              class="internal-link {TD_NODE}"
              on:click={async (e) => {
                await openOrSwitch(app, node.to, e)
              }}
              on:contextmenu={(e) => {
                openMenu(e, app)
              }}
              on:mouseover={(e) => hoverPreview(e, view, dropPath(node.to))}
            >
              {dropPath(node.to)}
            </td>
            <td class={TD_MEASURE}>{node.measure}</td>
          </tr>
        {/if}
      {/each}
    {/await}
  {/if}
</table>

<style>
</style>
