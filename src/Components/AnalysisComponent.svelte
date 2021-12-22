<script lang="ts">
  import type { App } from 'obsidian'
  import Louvain from './Louvain.svelte'
  import type AnalysisView from 'src/AnalysisView'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import CoCitations from './CoCitations.svelte'
  import LabelPropagation from './LabelPropagation.svelte'
  import ScrollSelector from './ScrollSelector.svelte'
  import TableComponent from './TableComponent.svelte'
  import HITS from './HITS.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let currSubtype: Subtype

  $: props = {
    app,
    plugin,
    settings,
    view,
    currSubtype,
  }
</script>

<ScrollSelector bind:currSubtype {view} />

{#if currSubtype === 'Adamic Adar'}
  <TableComponent {...props} />
<!-- {:else if currSubtype === 'Common Neighbours'}
  <TableComponent {...props} /> -->
{:else if currSubtype === 'Jaccard'}
  <TableComponent {...props} />
{:else if currSubtype === 'Co-Citations'}
  <CoCitations {...props} />
{:else if currSubtype === 'Label Propagation'}
  <LabelPropagation {...props} />
{:else if currSubtype === 'Overlap'}
  <TableComponent {...props} />
{:else if currSubtype === 'Clustering Coefficient'}
  <TableComponent {...props} />
{:else if currSubtype === 'BoW'}
  <TableComponent {...props} />
{:else if currSubtype === 'Otsuka-Chiai'}
  <TableComponent {...props} />
  <!-- {:else if currSubtype === 'Tversky'}
  <TableComponent {...props} /> -->
{:else if currSubtype === 'Sentiment'}
  <TableComponent {...props} />
{:else if currSubtype === 'Louvain'}
  <Louvain {...props} />
{:else if currSubtype === 'HITS'}
  <HITS {...props} />
{/if}
