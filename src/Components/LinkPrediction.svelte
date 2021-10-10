<script lang="ts">
  import type { App } from 'obsidian'
  import { LINK_PREDICTION_TYPES } from 'src/Algorithms/LinkPrediction'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/Constants'
  import type { GraphAnalysisSettings } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    debug,
    dropPath,
    hoverPreview,
    linkedQ,
    openMenu,
    openOrSwitch,
  } from 'src/Utility'
  import { onMount } from 'svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView

  let subtype = 'Adamic Adar'

  $: currFile = app.workspace.getActiveFile()
  $: currNode = currFile.path.split('.md', 1)[0]
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let { resolvedLinks } = app.metadataCache
  // $: subtype = 'Adamic Adar'
  // $: measures = plugin.g.getData(subtype, currNode)
  // $: predictionArr = plugin.g.nodes().map((to) => {
  //   const i = plugin.g.node(to)
  //   return {
  //     measure: measures[i],
  //     linked: linkedQ(resolvedLinks, currNode, to),
  //     to,
  //   }
  // })

  $: promisePredictionArr = plugin.g
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
    // value = 'Adamic Adar'
    debug(settings, { similarityArr: predictionArr })
  })

  let { noInfinity, noZero } = settings
</script>

<div>
  <span
    >Link Prediction Algorithm:
    <select bind:value={subtype}>
      {#each LINK_PREDICTION_TYPES as subtype}
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
      <th scope="col">Prediction</th>
    </tr>
  </thead>
  {#await promisePredictionArr then sortedPredictions}
    {#each sortedPredictions as node}
      {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
        <tr class={node.linked ? LINKED : NOT_LINKED}>
          <td
            class="internal-link {TD_NODE}"
            on:click={(e) => openOrSwitch(app, node.to, currFile, e)}
            on:mouseover={(e) => hoverPreview(e, view)}
            on:contextmenu={(e) => {
              openMenu(e, app)
            }}
          >
            {dropPath(node.to)}
          </td>
          <td class={TD_MEASURE}>
            {node.measure}
          </td>
        </tr>
      {/if}
    {/each}
  {/await}
</table>

<style>
</style>
