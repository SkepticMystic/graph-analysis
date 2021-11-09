<script lang="ts">
  import type { App } from 'obsidian'
  import { hoverPreview, isInVault, openOrSwitch } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/constants'
  import {
    dropExt,
    dropPath,
    isUnresolved,
    openMenu,
    presentPath,
  } from 'src/Utility'
  import FaLink from 'svelte-icons/fa/FaLink.svelte'
  import ExtensionIcon from './ExtensionIcon.svelte'

  export let app: App
  export let view: AnalysisView
  export let promiseSortedResults: Promise<
    {
      measure: number
      linked: boolean
      to: string
      extra: any
    }[]
  >
  export let currNode: string
  export let noZero: boolean
  export let noInfinity: boolean
</script>

<table class="graph-analysis-table markdown-preview-view">
  <thead>
    <tr>
      <th scope="col">Note</th>
      <th scope="col">Measure</th>
    </tr>
  </thead>
  {#if promiseSortedResults}
    {#await promiseSortedResults then sortedSimilarities}
      {#each sortedSimilarities as node}
        {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
          <tr
            class={node.linked ? LINKED : NOT_LINKED}
            aria-label={node.extra.map(presentPath).join('\n')}
            aria-label-position="left"
          >
            <td
              class="internal-link {TD_NODE} 
              {node.to.endsWith('.md') && !isInVault(app, dropExt(node.to))
                ? 'is-unresolved'
                : ''}"
              on:click={async (e) => {
                await openOrSwitch(app, node.to, e)
              }}
              on:contextmenu={(e) => {
                openMenu(e, app)
              }}
              on:mouseover={(e) => hoverPreview(e, view, dropPath(node.to))}
            >
              {#if node.linked}
                <span class="GA-Link-Icon">
                  <FaLink />
                </span>
              {/if}
              {#if !node.to.endsWith('.md')}
                <ExtensionIcon path={node.to} />
              {/if}
              {presentPath(node.to)}
            </td>
            <td class={TD_MEASURE}>{node.measure}</td>
          </tr>
        {/if}
      {/each}
    {/await}
  {/if}
</table>

<style>
  table.graph-analysis-table {
    border-collapse: collapse;
  }
  table.graph-analysis-table,
  table.graph-analysis-table tr,
  table.graph-analysis-table td {
    border: 1px solid var(--background-modifier-border);
  }

  table.graph-analysis-table td {
    padding: 2px;
  }
</style>
