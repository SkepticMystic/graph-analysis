<script lang="ts">
  import { App, Menu, Notice } from 'obsidian'
  import { SIMILARITY_TYPES } from 'src/Algorithms/Similarity'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/Constants'
  import type { GraphAnalysisSettings } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    createOrUpdateYaml,
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

  let currFile = app.workspace.getActiveFile()
  $: currNode = currFile.path.split('.md', 1)[0]
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let resolvedLinks = app.metadataCache.resolvedLinks
  $: promiseSortedSimilarities = plugin.g.getData('Co-Citations', currNode)
    .then(ccRess => plugin.g.nodes().map((to) => {
      const i = plugin.g.node(to)
      return {
        measure: ccRess[i].measure,
        coCitations: ccRess[i].coCitations,
        linked: linkedQ(resolvedLinks, currNode, to),
        to,
      }
    }).sort((a, b) =>
      a.measure > b.measure ? -1 : 1
    )).then(res => {console.log({res}); return res;});

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { promiseSortedSimilarities})
  })

  let { noInfinity, noZero } = settings
  //   let [noInfinity, noZero] = [settings.noInfinity, settings.noZero]
</script>


<table class="graph-analysis-table markdown-preview-view">
  <thead>
    <tr>
      <th scope="col">Note</th>
      <th scope="col">Similarity</th>
    </tr>
  </thead>
  {#await promiseSortedSimilarities then sortedSimilarities}
      {#each sortedSimilarities as node}
        {#if node.to !== currNode && node !== undefined && node.measure !== Infinity && node.measure !== 0}
        <tr class={node.linked ? LINKED : NOT_LINKED}>
          <td
            class="internal-link {TD_NODE}"
            on:click={(e) => {
              openOrSwitch(app, node.to, currFile, e)
            }}
            on:contextmenu={(e) => {
              openMenu(e)
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
