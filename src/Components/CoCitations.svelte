<script lang="ts">
  import type { App } from 'obsidian'
  import type AnalysisView from 'src/AnalysisView'
  import { LINKED, NOT_LINKED, TD_MEASURE, TD_NODE } from 'src/Constants'
  import type { CoCitationRes, GraphAnalysisSettings } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import {
    debug,
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
  $: promiseSortedSimilarities = plugin.g
    .getData('Co-Citations', currNode)
    .then((ccRess: CoCitationRes[]) =>
      plugin.g
        .nodes()
        .map((to) => {
          const i = plugin.g.node(to)
          return {
            measure: ccRess[i].measure,
            coCitations: ccRess[i].coCitations,
            linked: linkedQ(resolvedLinks, currNode, to),
            to,
          }
        })
        .sort((a, b) => (a.measure > b.measure ? -1 : 1))
    )
    .then((res) => {
      debug(settings, {res});
      return res
    })

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { promiseSortedSimilarities })
  })

  let { noInfinity, noZero } = settings
  //   let [noInfinity, noZero] = [settings.noInfinity, settings.noZero]
</script>

<div class="GA-CCs">
  {#await promiseSortedSimilarities then sortedSimilarities}
    {#each sortedSimilarities as node}
      {#if node.to !== currNode && node !== undefined && node.measure !== Infinity && node.measure !== 0}
        <div class="GA-CC">
          <details>
            <summary>
              <span
                class="{node.linked ? LINKED : NOT_LINKED} {node.to} top-row"
              >
                <span
                  class="internal-link {TD_NODE}"
                  on:click={(e) => {
                    openOrSwitch(app, node.to, currFile, e)
                  }}
                  on:contextmenu={(e) => {
                    openMenu(e, app)
                  }}
                  on:mouseover={(e) => hoverPreview(e, view)}>{node.to}</span
                >
                <span class={TD_MEASURE}>{node.measure}</span>
              </span>
            </summary>
            <div class="GA-details">
              {#each node.coCitations as coCite}
                <div class="CC-item">
                  <span
                    class="internal-link {TD_NODE}"
                    on:click={(e) => {
                      openOrSwitch(app, coCite.source, currFile, e)
                    }}
                    on:contextmenu={(e) => {
                      openMenu(e, app)
                    }}
                    on:mouseover={(e) => hoverPreview(e, view)}
                    >{coCite.source}</span
                  >
                  <span class={TD_MEASURE}>{coCite.measure}</span>
                </div>
                <div
                  class="CC-sentence"
                  on:click={(e) => {
                    openOrSwitch(app, coCite.source, currFile, e)
                  }}
                >
                  {#if coCite.measure < 0.5}
                    <span>{coCite.sentence[0]}</span>
                    <mark>{coCite.sentence[1]}</mark>
                    <span>{coCite.sentence[2]}</span>
                  {:else}
                    <span>{coCite.sentence[0]}</span>
                    <mark>{coCite.sentence[1]}</mark>
                    <span>{coCite.sentence[2]}</span>
                    <mark>{coCite.sentence[3]}</mark>
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
</div>

<style>
  .GA-CCs {
    display: flex;
    flex-direction: column;
  }

  .GA-CC {
    /* border: 1px solid var(--background-modifier-border);
    border-radius: 3px; */
    /* padding: 5px; */
  }

  .GA-details {
    /* border: 1px solid var(--background-modifier-border);
    border-radius: 3px; */
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
