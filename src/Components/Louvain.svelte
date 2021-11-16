<script lang="ts">
  import type { App } from 'obsidian'
  import { hoverPreview, isInVault, isLinked } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import { ANALYSIS_TYPES, ICON, LINKED, NOT_LINKED } from 'src/Constants'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    classExt,
    dropPath,
    getImgBufferPromise,
    isImg,
    openMenu,
    openOrSwitch,
    presentPath,
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
  let frozen = false
  let ascOrder = false
  let { noInfinity, noZero } = settings
  let currFile = app.workspace.getActiveFile()

  let resolution = 10
  interface ComponentResults {
    linked: boolean
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

  let { resolvedLinks } = app.metadataCache

  app.workspace.on('active-leaf-change', () => {
    if (!frozen) {
      blockSwitch = true
      newBatch = []
      visibleData = []
      promiseSortedResults = null
      page = 0

      setTimeout(() => (currFile = app.workspace.getActiveFile()), 100)
    }
  })

  onMount(() => {
    currNode = currFile?.path
  })

  $: promiseSortedResults =
    !plugin.g || !currNode
      ? null
      : plugin.g.algs['Louvain'](currNode, { resolution })
          .then((results: string[]) => {
            const componentResults: ComponentResults[] = []
            results.forEach((to) => {
              const resolved = !to.endsWith('.md') || isInVault(app, to)
              const linked = isLinked(resolvedLinks, currNode, to, false)
              const img =
                plugin.settings.showImgThumbnails && isImg(to)
                  ? getImgBufferPromise(app, to)
                  : null
              componentResults.push({
                linked,
                to,
                resolved,
                img,
              })
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
  bind:currFile
  bind:frozen
  {app}
  {plugin}
  {view}
  bind:blockSwitch
  bind:newBatch
  bind:visibleData
  bind:promiseSortedResults
  bind:page
/>

<label for="resolution">Resolution: </label>
<input
  name="resolution"
  type="range"
  min="1"
  max="20"
  value={resolution}
  on:change={(e) => {
    const value = Number.parseInt(e.target.value)

    if (!frozen) {
      blockSwitch = true
      newBatch = []
      visibleData = []
      promiseSortedResults = null
      page = 0
    }
    console.log({ value })
    resolution = value
  }}
/>

<div class="GA-Results" bind:this={current_component}>
  {#if promiseSortedResults}
    {#await promiseSortedResults then sortedResults}
      {#key sortedResults}
        {#each visibleData as node}
          {#if node.to !== currNode && node !== undefined}
            <div
              class="
                {node.linked ? LINKED : NOT_LINKED} 
              {classExt(node.to)}"
              on:click={async (e) => await openOrSwitch(app, node.to, e)}
            >
              <span
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
              </span>
            </div>
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
</div>

<style>
  .GA-Results > div {
    padding: 0px 5px;
  }
  .is-unresolved {
    color: var(--text-muted);
  }

  .GA-node {
    overflow: hidden;
  }
</style>
