<script lang="ts">
  import type { App } from 'obsidian'
  import { hoverPreview, isInVault, isLinked } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import {
    ANALYSIS_TYPES,
    ICON,
    LINKED,
    MEASURE,
    NOT_LINKED,
  } from 'src/Constants'
  import type {
    GraphAnalysisSettings,
    HITSResult,
    Subtype,
  } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    classExt,
    dropPath,
    getImgBufferPromise,
    isImg,
    openMenu,
    openOrSwitch,
    presentPath,
    roundNumber,
  } from 'src/Utility'
  import { onMount } from 'svelte'
  import FaLink from 'svelte-icons/fa/FaLink.svelte'
  import InfiniteScroll from 'svelte-infinite-scroll'
  import ExtensionIcon from './ExtensionIcon.svelte'
  import ImgThumbnail from './ImgThumbnail.svelte'
  import SubtypeOptions from './SubtypeOptions.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let currSubtype: Subtype

  $: currSubtypeInfo = ANALYSIS_TYPES.find((sub) => sub.subtype === currSubtype)

  let sortBy = true
  let ascOrder = false
  let { noInfinity, noZero } = settings
  let currFile = app.workspace.getActiveFile()

  interface ComponentResults {
    authority: number
    hub: number
    to: string
    resolved: boolean
    img: Promise<ArrayBuffer> | null
  }

  $: currNode = currFile?.path
  let size = 50
  let current_component: HTMLElement
  let newBatch: ComponentResults[] = []
  let visibleData: ComponentResults[] = []
  let page = 0
  let blockSwitch = false

  app.workspace.on('active-leaf-change', () => {
    blockSwitch = true
    setTimeout(() => {
      blockSwitch = false
      currFile = app.workspace.getActiveFile()
    }, 100)
    newBatch = []
  })

  onMount(() => {})

  $: promiseSortedResults = !plugin.g
    ? null
    : plugin.g.algs['HITS']('')
        .then((results: HITSResult) => {
          console.log('hits')
          const componentResults: ComponentResults[] = []

          plugin.g.forEachNode((to) => {
            const authority = roundNumber(results.authorities[to])
            const hub = roundNumber(results.hubs[to])
            if (!(authority === 0 && hub === 0)) {
              const resolved = !to.endsWith('.md') || isInVault(app, to)

              const img =
                plugin.settings.showImgThumbnails && isImg(to)
                  ? getImgBufferPromise(app, to)
                  : null

              componentResults.push({
                authority,
                hub,
                to,
                resolved,
                img,
              })
            }
          })
          const greater = ascOrder ? 1 : -1
          const lesser = ascOrder ? -1 : 1
          componentResults.sort((a, b) => {
            return sortBy
              ? a.authority > b.authority
                ? greater
                : lesser
              : a.hub > b.hub
              ? greater
              : lesser
          })
          return componentResults
        })
        .then((res) => {
          newBatch = res.slice(0, size)
          setTimeout(() => {
            blockSwitch = false
          }, 100)
          return res
        })

  $: visibleData = [...visibleData, ...newBatch]

  onMount(() => {
    currFile = app.workspace.getActiveFile()
  })
</script>

<SubtypeOptions
  bind:currSubtypeInfo
  bind:noZero
  bind:ascOrder
  bind:sortBy
  bind:currFile
  {app}
  {plugin}
  {view}
  bind:blockSwitch
  bind:newBatch
  bind:visibleData
  bind:promiseSortedResults
  bind:page
/>

<table class="GA-table markdown-preview-view" bind:this={current_component}>
  <thead>
    <tr>
      <th scope="col">Note</th>
      <th scope="col">Authority</th>
      <th scope="col">Hub</th>
    </tr>
  </thead>
  {#if promiseSortedResults}
    {#await promiseSortedResults then sortedResults}
      {#key sortedResults}
        {#each visibleData as node}
          {#if node !== undefined}
            <!-- svelte-ignore a11y-unknown-aria-attribute -->
            <tr
              class="
              {classExt(node.to)}"
            >
              <td
                on:click={async (e) => await openOrSwitch(app, node.to, e)}
                on:contextmenu={(e) => openMenu(e, app)}
                on:mouseover={(e) => hoverPreview(e, view, dropPath(node.to))}
              >
                <ExtensionIcon path={node.to} />

                <span
                  class="internal-link 
                  {node.resolved ? '' : 'is-unresolved'} 
                    {currNode === node.to ? 'currNode' : ''}"
                >
                  {presentPath(node.to)}
                </span>
                {#if isImg(node.to)}
                  <ImgThumbnail img={node.img} />
                {/if}
              </td>
              <td class={MEASURE}>{node.authority}</td>
              <td class={MEASURE}>{node.hub}</td>
            </tr>
          {/if}
        {/each}

        <InfiniteScroll
          hasMore={sortedResults.length > visibleData.length}
          threshold={100}
          elementScroll={current_component.parentNode}
          on:loadMore={() => {
            if (!blockSwitch) {
              page++
              newBatch = sortedResults.slice(size * page, size * (page + 1) - 1)
              console.log({ newBatch })
            }
          }}
        />
        {visibleData.length} / {sortedResults.length}
      {/key}
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
    /* font-size: var(--font-size-secondary); */
  }

  .is-unresolved {
    color: var(--text-muted);
  }

  .GA-node {
    overflow: hidden;
  }

  .currNode {
    font-weight: bold;
  }
</style>
