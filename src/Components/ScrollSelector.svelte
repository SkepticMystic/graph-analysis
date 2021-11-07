<script lang="ts">
  import type AnalysisView from 'src/AnalysisView'
  import { SUBTYPES } from 'src/constants'
  import type { Subtype } from 'src/Interfaces'

  export let currSubtype: Subtype
  export let view: AnalysisView
</script>

<div class="scrollContainer">
  <div class="container">
    {#each SUBTYPES as subtype}
      <span
        class="item {subtype.global ? 'GA-Global' : ''} {currSubtype ===
        subtype.subtype
          ? 'currSubtype'
          : ''}"
        on:click={() => {
          currSubtype = subtype.subtype
          view.currSubtype = subtype.subtype
        }}>{subtype.subtype}</span
      >
    {/each}
  </div>
</div>

<style>
  .container {
    overflow: auto;
    white-space: nowrap;
  }

  .item {
    display: inline-block;
    border: 1px solid transparent;
    background-color: var(--background-primary-alt);
    border-radius: 10px;
    color: var(--text-normal);
    text-align: center;
    padding: 2px 4px;
    margin: 0px 3px;
    width: fit-content;
    font-size: small;
  }

  .currSubtype {
    font-weight: 600;
  }

  .container > span:last-child {
    margin-right: 10px;
  }
  .container > span:first-child {
    margin-left: 10px;
  }

  .item:hover {
    background-color: var(--interactive-accent);
  }
</style>
