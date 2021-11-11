<script lang="ts">
  import type AnalysisView from 'src/AnalysisView'
  import { ANALYSIS_TYPES } from 'src/Constants'
  import type { Analyses, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import InfoIcon from './InfoIcon.svelte'
  import IoMdRefresh from 'svelte-icons/io/IoMdRefresh.svelte'
  import IoIosTrendingUp from 'svelte-icons/io/IoIosTrendingUp.svelte'
  import IoIosTrendingDown from 'svelte-icons/io/IoIosTrendingDown.svelte'
  import MdExposureZero from 'svelte-icons/md/MdExposureZero.svelte'
  import FaCreativeCommonsZero from 'svelte-icons/fa/FaCreativeCommonsZero.svelte'

  export let anl: Analyses
  export let currSubtype: Subtype
  export let noZero: boolean = undefined
  export let ascOrder: boolean = undefined
  export let plugin: GraphAnalysisPlugin
  export let view: AnalysisView
</script>

<span class="GA-Subtype-Options">
  <InfoIcon
    desc={ANALYSIS_TYPES[anl].find((type) => type.subtype === currSubtype).desc}
  />

  {#if noZero !== undefined}
    <span
      class="GA-Option-span"
      aria-label={noZero ? 'Show Zeros' : 'Hide Zeros '}
      on:click={() => (noZero = !noZero)}
    >
      <span class="icon">
        {#if noZero}
          <MdExposureZero />
        {:else}
          <FaCreativeCommonsZero />
        {/if}
      </span>
    </span>
  {/if}
  {#if ascOrder !== undefined}
    <span
      class="GA-Option-span"
      aria-label={ascOrder ? 'Ascending' : 'Descending '}
      on:click={() => (ascOrder = !ascOrder)}
    >
      <span class="icon">
        {#if ascOrder}
          <IoIosTrendingUp />
        {:else}
          <IoIosTrendingDown />
        {/if}
      </span>
    </span>
  {/if}
  <span
    class="GA-Option-span"
    aria-label="Refresh Index"
    on:click={async () => {
      await plugin.refreshGraph()
      await view.draw()
    }}
  >
    <span class="icon">
      <IoMdRefresh />
    </span>
  </span>
</span>

<style>
  .GA-Subtype-Options {
    margin-left: 10px;
  }
  .icon {
    color: var(--text-normal);
    display: inline-block;
    padding-top: 5px !important;
    width: 20px;
    height: 20px;
  }

  .GA-Option-span {
    padding: 2px;
  }
</style>
