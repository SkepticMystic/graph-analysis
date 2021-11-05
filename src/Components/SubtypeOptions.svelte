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
    <label for="Infinity">∞</label>
    <input
      name="Infinity"
      type="checkbox"
      checked={noInfinity}
      on:change={() => (noInfinity = !noInfinity)}
    />

    <label for="Zero">0</label>
    <input
      name="Zero"
      type="checkbox"
      checked={noZero}
      on:change={() => (noZero = !noZero)}
    />
  {#if ascOrder !== undefined}
    <span class="GA-Option-span">
      <label for="order" aria-label="Ascending/Descending Order">📈</label>
      <input
        aria-label={ascOrder ? 'Ascending' : 'Descending'}
        name="order"
        type="checkbox"
        checked={ascOrder}
        on:change={() => (ascOrder = !ascOrder)}
      />
    </span>
  {/if}
</div>
