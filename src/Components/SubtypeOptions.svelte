<script lang="ts">
  import InfoIcon from './InfoIcon.svelte'
  import { ANALYSIS_TYPES } from 'src/constants'
  import type { Analyses, Subtype } from 'src/Interfaces'

  export let anl: Analyses
  export let currSubtype: Subtype
  export let noInfinity: boolean = undefined
  export let noZero: boolean = undefined
  export let ascOrder: boolean = undefined
</script>

<div>
  <label for="Alg">Alg:</label>
  <select bind:value={currSubtype} name="Alg" class="dropdown GA-DD">
    {#each ANALYSIS_TYPES[anl] as subtype}
      <option value={subtype.subtype}>{subtype.subtype}</option>
    {/each}
  </select>
  <InfoIcon
    desc={ANALYSIS_TYPES[anl].find((type) => type.subtype === currSubtype).desc}
  />

  {#if noInfinity !== undefined && noZero !== undefined}
    <!-- <label for="Infinity">∞</label>
    <input
      name="Infinity"
      type="checkbox"
      checked={noInfinity}
      on:change={() => (noInfinity = !noInfinity)}
    /> -->

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
</div>

<style>
  .GA-Option-span {
    border: 1px solid var(--background-modifier-border);
    border-radius: 5px;
    padding: 2px;
  }
</style>
