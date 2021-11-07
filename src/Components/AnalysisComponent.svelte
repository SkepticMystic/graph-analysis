<script lang="ts">
  import type { App } from 'obsidian'
  import ScrollSelector from './ScrollSelector.svelte'
  import type AnalysisView from 'src/AnalysisView'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import AdamicAdar from './AdamicAdar.svelte'
  import CommonNeighbours from './CommonNeighbours.svelte'
  import Jaccard from './Jaccard.svelte'
  import LabelPropagation from './LabelPropagation.svelte'
  import Overlap from './Overlap.svelte'
  import ClusteringCoefficient from './ClusteringCoefficient.svelte'
  import CoCitations from './CoCitations.svelte'

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
  <AdamicAdar {...props} />
  <!-- ✔️ -->
{:else if currSubtype === 'Common Neighbours'}
  <CommonNeighbours {...props} />
  <!-- ✔️ -->
{:else if currSubtype === 'Jaccard'}
  <Jaccard {...props} />
  <!-- ✔️ -->
{:else if currSubtype === 'Co-Citations'}
  <CoCitations {...props} />
  <!-- ✔️ -->
{:else if currSubtype === 'Label Propagation'}
  <LabelPropagation {...props} />
  <!-- ✔️ -->
{:else if currSubtype === 'Overlap'}
  <Overlap {...props} />
{:else if currSubtype === 'Clustering Coefficient'}
  <ClusteringCoefficient {...props} />
  <!-- ✔️ -->
{/if}
