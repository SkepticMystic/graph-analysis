<script lang="ts">
  import type { App } from 'obsidian'
  import { openOrSwitch } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/constants'
  import type { Analyses, GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    debug,
    dropPath,
    getPromiseResults,
    hoverPreview,
    openMenu,
  } from 'src/Utility'
  import { onMount } from 'svelte'
  import SubtypeOptions from './SubtypeOptions.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let anl: Analyses

  let currSubtype: Subtype = 'Adamic Adar'

  $: currFile = app.workspace.getActiveFile()
  $: currNode = currFile?.path.split('.md', 1)[0]
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let { resolvedLinks } = app.metadataCache

  $: promisePredictionArr = getPromiseResults(
    plugin,
    currNode,
    currSubtype,
    resolvedLinks
  )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { similarityArr: promisePredictionArr })
  })

  let { noInfinity, noZero } = settings
</script>

<SubtypeOptions bind:currSubtype bind:noInfinity bind:noZero {anl} />

<table class="graph-analysis-table markdown-preview-view">
  <thead>
    <tr>
      <th scope="col">Note</th>
      <th scope="col">Measure</th>
    </tr>
  </thead>
  {#if promisePredictionArr}
    {#await promisePredictionArr then sortedPredictions}
      {#each sortedPredictions as node}
        {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
          <tr
            class={node.linked ? LINKED : NOT_LINKED}
            aria-label={node.extra.map(dropPath).join('\n')}
            aria-label-position="left"
          >
            <td
              class="internal-link {TD_NODE}"
              on:click={(e) => openOrSwitch(app, node.to, e)}
              on:mouseover={(e) => hoverPreview(e, view, dropPath(node.to))}
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
  {/if}
</table>

<style>
</style>
