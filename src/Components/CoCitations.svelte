<script lang="ts">
  import type { App } from 'obsidian'
  import type AnalysisView from 'src/AnalysisView'
  import {
    ANALYSIS_TYPES,
    ICON,
    LINKED,
    MEASURE,
    NODE,
    NOT_LINKED,
  } from 'src/Constants'
  import type {
    CoCitation,
    CoCitationMap,
    CoCitationRes,
    GraphAnalysisSettings,
    Subtype,
  } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    classExt,
    debug,
    dropPath,
    getImgBufferPromise,
    hoverPreview,
    isImg,
    jumpToSelection,
    looserIsLinked,
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
  import RenderedMarkdown from './RenderedMarkdown.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let currSubtype: Subtype

  $: currSubtypeInfo = ANALYSIS_TYPES.find((sub) => sub.subtype === currSubtype)

  interface CoCiteComp {
    measure: number
    coCitations: CoCitation[]
    linked: boolean
    resolved: boolean
    to: string
  }

  let frozen = false
  let size = 50

  let currNode: string
  let current_component: HTMLElement
  let newBatch: CoCiteComp[] = []
  let visibleData: CoCiteComp[] = []
  let page = 0
  let blockSwitch = false

  let currFile = app.workspace.getActiveFile()
  $: currNode = currFile?.path
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

  let ascOrder = false
  $: promiseSortedResults =
    !currNode || !plugin.g
      ? null
      : plugin.g.algs['Co-Citations'](currNode)
        .then((ccMap: CoCitationMap) => {
          Object.values(ccMap).forEach((value: CoCitationRes) => {
            value.coCitations = value.coCitations.sort((a, b) => {
              return a.measure > b.measure ? -1 : 1
              },
            )
          })
          const greater = ascOrder ? 1 : -1
          const lesser = ascOrder ? -1 : 1
          const sortedCites: CoCiteComp[] = []
          Object.keys(ccMap).forEach((to) => {
            let { coCitations, measure, resolved } = ccMap[
              to
              ] as CoCitationRes
            if (measure !== 0 && measure !== Infinity) {
              sortedCites.push({
                measure,
                coCitations,
                linked: looserIsLinked(app, to, currNode, false),
                resolved,
                to,
              })
            }
          })
          sortedCites.sort((a, b) => {
            return a.measure > b.measure ? greater :
                a.measure !== b.measure ||
                presentPath(a.to).toLowerCase() > presentPath(b.to).toLowerCase() ? lesser : greater
            }
          )
          return sortedCites
        })
        .then((res) => {
          newBatch = res.slice(0, size)
          debug(settings, { res })
          setTimeout(() => {
            blockSwitch = false
          }, 100)
          return res
        })

  $: visibleData = [...visibleData, ...newBatch]

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { promiseSortedResults })
  })
</script>

<SubtypeOptions
  bind:ascOrder
  bind:frozen
  bind:currFile
  {currSubtypeInfo}
  {app}
  {plugin}
  {view}
  bind:blockSwitch
  bind:newBatch
  bind:visibleData
  bind:promiseSortedResults
  bind:page
/>

<div class="GA-CCs" bind:this={current_component}>
  {#if promiseSortedResults}
    {#await promiseSortedResults then sortedResults}
      {#key sortedResults}
        {#each visibleData as node}
          {#if node.to !== currNode && node !== undefined}
            <div class="GA-CC">
              <details>
                <summary>
                  <span class="top-row">
                    <span
                      class="
                                     {classExt(node.to)}
                                     {node.linked ? LINKED : NOT_LINKED}
                                     {NODE}"
                      on:click={async (e) => {
                        if (node.to[0] !== '#') {
                          await openOrSwitch(app, node.to, e)
                        }
                      }}
                      on:contextmenu={(e) => openMenu(e, app)}
                      on:mouseover={(e) =>
                        hoverPreview(e, view, dropPath(node.to))}
                    >
                      {#if node.to[0] === '#'}
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <a class="tag">{node.to}</a>
                      {:else}
                        {#if node.linked}
                          <span class={ICON}>
                            <FaLink />
                          </span>
                        {/if}
                        <ExtensionIcon path={node.to} />
                        <span
                          class="
                                     internal-link
                                     {node.resolved ? '' : 'is-unresolved'}"
                        >
                          {presentPath(node.to)}
                        </span>
                        {#if plugin.settings.showImgThumbnails && isImg(node.to)}
                          <ImgThumbnail
                            img={getImgBufferPromise(app, node.to)}
                          />
                        {/if}
                      {/if}
                    </span>
                    <span class={MEASURE}>{roundNumber(node.measure, 3)}</span>
                  </span>
                </summary>
                <div class="GA-details">
                  {#each node.coCitations as coCite}
                    <div class="CC-item">
                      <span
                        class="internal-link {NODE}"
                        on:click={async (e) =>
                          await openOrSwitch(app, coCite.source, e)}
                        on:contextmenu={(e) => openMenu(e, app)}
                        on:mouseover={(e) =>
                          hoverPreview(e, view, dropPath(coCite.source))}
                      >
                        {presentPath(coCite.source)}
                      </span>
                      <span class={MEASURE}>
                        {roundNumber(coCite.measure, 3)}
                      </span>
                    </div>
                    <RenderedMarkdown
                      sentence={coCite.sentence}
                      sourcePath={coCite.source}
                      app={app}
                      line={coCite.line}
                    />
                  {/each}
                </div>
              </details>
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
            }
          }}
        />
        {visibleData.length} / {sortedResults.length}
      {/key}
    {/await}
  {/if}
</div>

<style>
  .GA-CCs {
    display: flex;
    flex-direction: column;
    padding-left: 10px;
  }

  /* .GA-CC {
    border: 1px solid var(--background-modifier-border);
    border-radius: 3px; 
    padding: 5px; 
  } */

  .is-unresolved {
    color: var(--text-muted);
  }

  .tag {
    border-radius: 15px !important;
  }

  .GA-node,
  .CC-sentence {
    font-size: var(--font-size-secondary);
    border: 1px solid transparent;
    border-radius: 5px;
  }

  .CC-sentence:hover {
    background-color: var(--background-secondary-alt);
  }
  span.GA-measure {
    background-color: var(--background-secondary-alt);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 12px;
    line-height: 12px;
  }
  span.GA-measure:hover {
    background-color: var(--interactive-accent);
  }

  .CC-item {
    padding-left: 30px;
    font-weight: 600;
  }


  .top-row > span + span {
    float: right;
  }


</style>
