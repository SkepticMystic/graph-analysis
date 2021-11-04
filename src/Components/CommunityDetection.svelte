<script lang="ts">
  import type { App } from 'obsidian'
  import { hoverPreview, openOrSwitch } from 'obsidian-community-lib'
  import { openMenu } from 'src/Utility'
  import type AnalysisView from 'src/AnalysisView'
  import { TD_MEASURE, TD_NODE } from 'src/constants'
  import type { GraphAnalysisSettings } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import { onMount } from 'svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView

  let currFile = app.workspace.getActiveFile()
  $: currNode = currFile?.path.split('.md', 1)[0]
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let its = 20
  const iterationsArr = Array(50)
    .fill(0)
    .map((i, j) => j + 1)

  $: promiseSortedComms = !plugin.g
    ? null
    : plugin.g.algs['Label Propagation']('', { iterations: its }).then(
        (comms) => {
          let sortedComms = Object.keys(comms)
            .map((label) => {
              let comm = comms[label] as unknown as string[]
              return { label, comm }
            })
            .sort((a, b) => (a.comm.length > b.comm.length ? -1 : 1))
          return sortedComms
        }
      )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
  })
</script>

<div class="GA-CCs">
  <div>
    <label for="iterations">Iterations: </label>
    <select class="dropdown GA-DD" bind:value={its} name="iterations">
      {#each iterationsArr as it}
        <option>{it}</option>
      {/each}
    </select>
  </div>
  {#if promiseSortedComms}
    {#await promiseSortedComms then sortedComms}
      {#each sortedComms as comm}
        {#if comm.comm.length > 1}
          <div class="GA-CC">
            <details>
              <summary
                on:contextmenu={(e) =>
                  openMenu(e, app, { toCopy: comm.comm.join('\n') })}
              >
                <span
                  class="top-row {comm.comm.includes(currNode)
                    ? 'currComm'
                    : ''}"
                >
                  <span>
                    {comm.label}
                  </span>
                  <span class={TD_MEASURE}>{comm.comm.length}</span>
                </span>
              </summary>
              <div class="GA-details">
                {#each comm.comm as member}
                  <div
                    class="internal-link {TD_NODE}"
                    on:click={async (e) => {
                      await openOrSwitch(app, member + '.md', e)
                    }}
                    on:mouseover={(e) => {
                      hoverPreview(e, view, member)
                    }}
                  >
                    {member}
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

  .GA-details {
    padding-left: 20px;
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

  .currComm {
    color: var(--text-accent);
  }
</style>
