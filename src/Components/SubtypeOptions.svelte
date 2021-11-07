<script lang="ts">
  import type AnalysisView from 'src/AnalysisView'
  import { ANALYSIS_TYPES } from 'src/constants'
  import type { Analyses, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import InfoIcon from './InfoIcon.svelte'

  export let anl: Analyses
  export let currSubtype: Subtype
  export let noZero: boolean = undefined
  export let ascOrder: boolean = undefined
  export let plugin: GraphAnalysisPlugin
  export let view: AnalysisView
</script>

<span>
  <InfoIcon
    desc={ANALYSIS_TYPES[anl].find((type) => type.subtype === currSubtype).desc}
  />

  {#if noZero !== undefined}
    <span
      class="GA-Option-span"
      aria-label={noZero ? 'Show Zeros' : 'Hide Zeros '}
      on:click={() => (noZero = !noZero)}
    >
      {noZero ? '∅' : '0'}
    </span>
  {/if}
  {#if ascOrder !== undefined}
    <span
      class="GA-Option-span"
      aria-label={ascOrder ? 'ascending' : 'descending '}
      on:click={() => (ascOrder = !ascOrder)}
    >
      {ascOrder ? '📈' : '📉'}
    </span>
  {/if}
  <button
    on:click={async () => {
      await plugin.refreshGraph()
      await view.draw()
    }}>🔁</button
  >
</span>

<style>
  .GA-Option-span {
    border: 1px solid var(--background-modifier-border);
    border-radius: 5px;
    padding: 2px;
  }
</style>
