<script lang="ts">
  import type { App } from 'obsidian'
  import { isLinked, openOrSwitch } from 'obsidian-community-lib'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/constants'
  import type {
    CoCitationRes,
    GraphAnalysisSettings,
    Subtype,
  } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    debug,
    dropPath,
    getCurrNode,
    hoverPreview,
    jumpToSelection,
    openMenu,
    roundNumber,
  } from 'src/Utility'
  import { onMount } from 'svelte'
  import SubtypeOptions from './SubtypeOptions.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let currSubtype: Subtype

  let ascOrder = false
  let currFile = app.workspace.getActiveFile()

  $: currNode = getCurrNode(currFile)
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let { resolvedLinks } = app.metadataCache
  $: promiseSortedCoCites =
    !currNode || !plugin.g
      ? null
      : plugin.g.algs['Co-Citations'](currNode)
          .then((ccMap) => {
            const greater = ascOrder ? 1 : -1
            const lesser = ascOrder ? -1 : 1
            let sortedCoCites = Object.keys(ccMap)
              .map((to) => {
                let cocitation = ccMap[to] as unknown as CoCitationRes
                return {
                  measure: cocitation.measure,
                  coCitations: cocitation.coCitations,
                  linked: isLinked(resolvedLinks, currNode, to, false),
                  to,
                }
              })
              .sort((a, b) => (a.measure > b.measure ? greater : lesser))
            return sortedCoCites
          })
          .then((res) => {
            debug(settings, { res })
            return res
          })

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { promiseSortedCoCites })
  })
</script>

<SubtypeOptions
  anl="Co-Citations"
  bind:ascOrder
  {currSubtype}
  {plugin}
  {view}
/>

<div class="GA-CCs">
  {#if promiseSortedCoCites}
    {#await promiseSortedCoCites then sortedCoCites}
      {#each sortedCoCites as node}
        {#if node.to !== currNode && node !== undefined && node.measure !== Infinity && node.measure !== 0}
          <div class="GA-CC">
            <details>
              <summary>
                <span class="{node.to} top-row">
                  <span
                    class="{node.linked
                      ? LINKED
                      : NOT_LINKED} internal-link {TD_NODE}
                      {node.to[0] === '#' ? 'tag' : ''}"
                    on:click={async (e) => {
                      if (node.to[0] === '#') {
                      } else {
                        await openOrSwitch(app, node.to, e)
                      }
                    }}
                    on:contextmenu={(e) => {
                      openMenu(e, app)
                    }}
                    on:mouseover={(e) => {
                      hoverPreview(e, view, dropPath(node.to))
                    }}
                  >
                    {(node.to[0] === '#') ? node.to : dropPath(node.to)}</span
                  >
                  <span class={TD_MEASURE}>{roundNumber(node.measure, 3)}</span>
                </span>
              </summary>
              <div class="GA-details">
                {#each node.coCitations as coCite}
                  <div class="CC-item">
                    <span
                      class="internal-link {TD_NODE}"
                      on:click={async (e) => {
                        await openOrSwitch(app, coCite.source, e)
                      }}
                      on:contextmenu={(e) => {
                        openMenu(e, app)
                      }}
                      on:mouseover={(e) =>
                        hoverPreview(e, view, dropPath(coCite.source))}
                      >{dropPath(coCite.source)}</span
                    >
                    <span class={TD_MEASURE}
                      >{roundNumber(coCite.measure, 3)}</span
                    >
                  </div>
                  <div
                    class="CC-sentence"
                    on:click={async (e) => {
                      await openOrSwitch(app, coCite.source, e)
                      jumpToSelection(
                        app,
                        coCite.line,
                        coCite.sentence.join('')
                      )
                    }}
                  >
                    {#if coCite.sentence.length === 3}
                      <span>{coCite.sentence[0]}</span>
                      <mark><strong>{coCite.sentence[1]}</strong></mark>
                      <span>{coCite.sentence[2]}</span>
                    {:else}
                      <span>{coCite.sentence[0]}</span>
                      <mark><strong>{coCite.sentence[1]}</strong></mark>
                      <span>{coCite.sentence[2]}</span>
                      <mark><strong>{coCite.sentence[3]}</strong></mark>
                      <span>{coCite.sentence[4]}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </details>
          </div>
        {/if}
      {/each}
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

  .tag {
    border-radius: 15px !important;
  }

  .analysis-node,
  .CC-sentence {
    font-size: var(--font-size-secondary);
    border: 1px solid transparent;
    border-radius: 5px;
  }

  .CC-sentence:hover {
    background-color: var(--background-secondary-alt);
  }
  span.analysis-measure {
    background-color: var(--background-secondary-alt);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 12px;
    line-height: 12px;
  }
  span.analysis-measure:hover {
    background-color: var(--interactive-accent);
  }

  .CC-item {
    padding-left: 30px;
    font-weight: 600;
  }

  .CC-sentence {
    padding-left: 40px;
    color: var(--text-muted);
  }
  .top-row span + span {
    float: right;
  }

  mark {
    color: var(--text-normal);
    background-color: var(--text-highlight-bg);
  }
</style>
