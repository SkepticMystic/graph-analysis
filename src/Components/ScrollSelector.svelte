<script lang="ts">
  import type AnalysisView from 'src/AnalysisView'
  import { SUBTYPES } from 'src/constants'
  import type { Subtype } from 'src/Interfaces'
  import FaGlobeAfrica from 'svelte-icons/fa/FaGlobeAfrica.svelte'
  export let currSubtype: Subtype
  export let view: AnalysisView
</script>

<div
  class="scrollContainer"
  on:mouseover={function () {
    this.ariaLabel = '`Shift + Scroll` to scroll sideways'
  }}
>
  <div class="container">
    {#each SUBTYPES as subtype}
      <button
        class="item GA-Button {currSubtype === subtype.subtype
          ? 'currSubtype'
          : ''}"
        on:click={() => {
          currSubtype = subtype.subtype
          view.currSubtype = subtype.subtype
        }}
      >
        {#if subtype.global}
          <span class="GA-Link-Icon">
            <FaGlobeAfrica />
          </span>
        {/if}
        {subtype.subtype}
      </button>
    {/each}
  </div>
</div>

<style>
  .container {
    overflow: auto;
    white-space: nowrap;
  }

  .GA-Button {
    width: fit-content !important;
    padding: 8px 5px !important;
    margin-right: 0px;
  }

  .item {
    display: inline-block;
    border: 1px solid transparent;
    background-color: var(--background-primary-alt);
    border-radius: 10px;
    color: var(--text-normal);
    text-align: center;
    padding: 0px 4px;
    margin: 0px 3px;
    width: fit-content;
    font-size: small;
  }

  .currSubtype {
    font-weight: 800 !important;
    color: var(--text-accent) !important;
  }

  .container > button:last-child {
    margin-right: 10px;
  }
  .container > button:first-child {
    margin-left: 10px;
  }

  .item:hover {
    background-color: var(--interactive-accent);
  }
</style>
