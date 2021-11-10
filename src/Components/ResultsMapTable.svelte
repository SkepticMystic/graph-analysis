<script lang="ts">
  import type { App } from 'obsidian'
  import { hoverPreview, openOrSwitch } from 'obsidian-community-lib'
  import type { ComponentResults } from 'src/Interfaces'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/constants'
  import { dropExt, dropPath, openMenu, presentPath } from 'src/Utility'
  import FaLink from 'svelte-icons/fa/FaLink.svelte'
  import ExtensionIcon from './ExtensionIcon.svelte'

  export let app: App
  export let view: AnalysisView
  export let promiseSortedResults: Promise<ComponentResults[]>
  export let currNode: string
  export let noZero: boolean
  export let noInfinity: boolean

  function _arrayBufferToBase64(buffer: ArrayBuffer) {
    var binary = ''
    var bytes = new Uint8Array(buffer)
    var len = bytes.byteLength
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
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
              {node.resolved ? '' : 'is-unresolved'}"
              on:click={async (e) => {
                await openOrSwitch(app, dropExt(node.to), e)
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
              {#if node.to && !node.to.endsWith('.md')}
                <ExtensionIcon path={node.to} />
              {/if}
              {presentPath(node.to)}
              {#if node.img !== null}
                {#await node.img then src}
                  <div class="GA-img">
                    <img
                      src={'data:image/jpg;base64, ' +
                        _arrayBufferToBase64(src)}
                    />
                  </div>
                {/await}
              {/if}
            </td>
            <td class={TD_MEASURE}>{node.measure}</td>
          </tr>
        {/if}
      {/each}
    {/await}
  {/if}
</table>

<style>
  .GA-img img {
    justify-content: center;
    justify-items: center;
    align-items: center;
    align-content: center;
    justify-self: center;
    align-self: center;
  }
  .GA-img img {
    max-width: 50%;
    max-height: 50%;
  }
  .GA-img img:hover {
    max-width: 100%;
    max-height: 100%;
  }
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

  .is-unresolved {
    color: var(--text-muted);
  }

  .analysis-node {
    overflow: hidden;
  }
</style>
