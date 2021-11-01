<script lang="ts">
  import type { App } from 'obsidian'
  import { hoverPreview, linkedQ, openOrSwitch } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import {
    CENTRALITY_TYPES,
    LINKED,
    NOT_LINKED,
    TD_MEASURE,
    TD_NODE,
  } from 'src/constants'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import { debug, dropPath } from 'src/Utility'
  import { onMount } from 'svelte'

  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let app: App
  export let view: AnalysisView

  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let value: Subtype = 'Closeness'
  $: resolvedLinks = app.metadataCache.resolvedLinks
  let { noInfinity, noZero } = settings

  $: currFile = app.workspace.getActiveFile()

  $: currNode = currFile.path.split('.md', 1)[0]
  let measures = plugin.g.getData(value, currNode)
  $: centralityArr = plugin.g.nodes().map((to, i) => {
    return {
      measure: measures[i],
      linked: linkedQ(resolvedLinks, currNode, to),
      to,
    }
  })

  $: sortedCentrals = centralityArr.sort((a, b) =>
    a.measure > b.measure ? -1 : 1
  )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { sortedCentrals })
  })
</script>

<div>
  <span
    >Centrality Algorithm:
    <select class="dropdown GA-DD" bind:value>
      {#each CENTRALITY_TYPES as subtype}
        <option value={subtype.subtype}>{subtype.subtype}</option>
      {/each}
    </select>
  </span>

  <span
    >Exclude Infinity:
    <input
      type="checkbox"
      checked={noInfinity}
      on:change={() => (noInfinity = !noInfinity)}
    />
  </span>

  <span
    >Exclude Zero:
    <input
      type="checkbox"
      checked={noZero}
      on:change={() => (noZero = !noZero)}
    />
  </span>
</div>

<table class="graph-analysis-table markdown-preview-view">
  <thead>
    <tr>
      <th scope="col">Note</th>
      <th scope="col">Centrality</th>
    </tr>
  </thead>
  {#each sortedCentrals as node}
    {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
      <tr class={node.linked ? LINKED : NOT_LINKED}>
        <td
          class="internal-link {TD_NODE}"
          on:click={async (e) => await openOrSwitch(app, node.to, e)}
          on:mouseover={(e) => hoverPreview(e, view)}
        >
          {dropPath(node.to)}
        </td>
        <td class={TD_MEASURE}>{node.measure}</td>
      </tr>
    {/if}
  {:else}
    <!-- this block renders when photos.length === 0 -->
    <p>loading...</p>
  {/each}
</table>

<style>
</style>
