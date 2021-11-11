<script lang="ts">
  import type { App } from 'obsidian'
  import { hoverPreview, openOrSwitch } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import { ICON, LINKED, MEASURE, NOT_LINKED } from 'src/Constants'
  import type { ComponentResults } from 'src/Interfaces'
  import {
    classExt,
    dropExt,
    dropPath,
    isImg,
    openMenu,
    presentPath,
  } from 'src/Utility'
  import FaLink from 'svelte-icons/fa/FaLink.svelte'
  import ExtensionIcon from './ExtensionIcon.svelte'
  import ImgThumbnail from './ImgThumbnail.svelte'

  export let app: App
  export let view: AnalysisView
  export let promiseSortedResults: Promise<ComponentResults[]>
  export let currNode: string
  export let noZero: boolean
  export let noInfinity: boolean
</script>

<table class="GA-table markdown-preview-view">
  <thead>
    <tr>
      <th scope="col">Note</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  {#if promiseSortedResults}
    {#await promiseSortedResults then sortedSimilarities}
      {#each sortedSimilarities as node}
        {#if node.to !== currNode && node !== undefined && !(noInfinity && node.measure === Infinity) && !(noZero && node.measure === 0)}
          <!-- svelte-ignore a11y-unknown-aria-attribute -->
          <tr
            class="{node.linked ? LINKED : NOT_LINKED} 
          {classExt(node.to)}"
          >
            <td
              aria-label={node.extra.map(presentPath).join('\n')}
              aria-label-position="left"
              on:click={async (e) =>
                await openOrSwitch(app, dropExt(node.to), e)}
              on:contextmenu={(e) => openMenu(e, app)}
              on:mouseover={(e) => hoverPreview(e, view, dropPath(node.to))}
            >
              {#if node.linked}
                <span class={ICON}>
                  <FaLink />
                </span>
              {/if}

              <ExtensionIcon path={node.to} />

              <span
                class="internal-link {node.resolved ? '' : 'is-unresolved'}"
              >
                {presentPath(node.to)}
              </span>
              {#if isImg(node.to)}
                <ImgThumbnail img={node.img} />
              {/if}
            </td>
            <td class={MEASURE}>{node.measure}</td>
          </tr>
        {/if}
      {/each}
    {/await}
  {/if}
</table>

<style>
  table.GA-table {
    border-collapse: collapse;
  }
  table.GA-table,
  table.GA-table tr,
  table.GA-table td {
    border: 1px solid var(--background-modifier-border);
  }

  table.GA-table td {
    padding: 2px;
  }

  .is-unresolved {
    color: var(--text-muted);
  }

  .GA-node {
    overflow: hidden;
  }
</style>
