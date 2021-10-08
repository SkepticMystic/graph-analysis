<script lang="ts">
  import type { App } from 'obsidian'
  import { SIMILARITY_TYPES } from 'src/Algorithms/Similarity'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/Constants'
  import type { GraphAnalysisSettings, Subtypes } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    debug,
    dropPath,
    hoverPreview,
    linkedQ,
    openOrSwitch,
  } from 'src/Utility'
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
  $: measures = plugin.g.getData(subtype, currNode)

  $: similarityArr = plugin.g.nodes().map((to) => {
    const i = plugin.g.node(to)
    return {
      measure: measures[i],
      linked: linkedQ(resolvedLinks, currNode, to),
      to,
    }
  })

  $: sortedSimilarities = similarityArr.sort((a, b) =>
    a.measure > b.measure ? -1 : 1
  )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    let subtype = 'Jaccard'
    debug(settings, { similarityArr })
  })

  let { noInfinity, noZero } = settings
  //   let [noInfinity, noZero] = [settings.noInfinity, settings.noZero]
</script>

<div>
  <span
    >Similarity Algorithm:
    <select bind:value={subtype}>
      {#each SIMILARITY_TYPES as subtype}
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
      <th scope="col">Similarity</th>
    </tr>
  </thead>
  {#each sortedSimilarities as node}
    {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
      <tr class={node.linked ? LINKED : NOT_LINKED}>
        <td
          class="internal-link {TD_NODE}"
          on:click={(e) => openOrSwitch(app, node.to, currFile, e)}
          on:mouseover={(e) => hoverPreview(e, view)}
        >
          {dropPath(node.to)}
        </td>
        <td class={TD_MEASURE}>{node.measure}</td>
      </tr>
    {/if}
  {/each}
</table>

<style>
</style>
