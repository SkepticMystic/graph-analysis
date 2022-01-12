<script lang="ts">
  import type AnalysisView from 'src/AnalysisView'
  import { ANALYSIS_TYPES, ICON } from 'src/Constants'
  import type { Subtype } from 'src/Interfaces'
  import FaGlobeAfrica from 'svelte-icons/fa/FaGlobeAfrica.svelte'
  import IoIosChatbubbles from 'svelte-icons/io/IoIosChatbubbles.svelte'

  export let currSubtype: Subtype
  export let view: AnalysisView
</script>

{#if view.plugin.settings.algsToShow.length > 1}
  {#key view.plugin.settings.algsToShow}
    <div
      class="scrollContainer"
      on:mouseover={function () {
        this.ariaLabel = '`Shift + Scroll` to scroll sideways'
      }}
    >
      <div class="container">
        {#each ANALYSIS_TYPES as sub}
          {#if view.plugin.settings.algsToShow.includes(sub.subtype)}
            <button
              class="item GA-Button {currSubtype === sub.subtype
                ? 'currSubtype'
                : ''}"
              on:click={() => {
                currSubtype = sub.subtype
                view.currSubtype = sub.subtype
              }}
            >
              {#if sub.global}
                <span class={ICON}>
                  <FaGlobeAfrica />
                </span>
              {/if}
              {#if sub.nlp}
                <span class={ICON}>
                  <IoIosChatbubbles />
                </span>
              {/if}
              {sub.subtype}
            </button>
          {/if}
        {/each}
      </div>
    </div>
  {/key}
{/if}

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
