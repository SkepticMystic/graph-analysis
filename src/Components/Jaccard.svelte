<!-- <script lang="ts">
  import type { App } from 'obsidian'
  import type AnalysisView from 'src/AnalysisView'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import ResultsMapTable from './ResultsMapTable.svelte'
  import SubtypeOptions from './SubtypeOptions.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let currSubtype: Subtype

  let frozen = false
  let ascOrder = false
  let { noInfinity, noZero } = settings
  let currFile = app.workspace.getActiveFile()
</script>

<SubtypeOptions
  bind:currSubtype
  bind:noZero
  bind:ascOrder
  bind:currFile
  bind:frozen
  anl="Similarity"
  {plugin}
  {view}
/>

<ResultsMapTable
  {app}
  {plugin}
  {view}
  {noInfinity}
  {noZero}
  {currSubtype}
  {frozen}
  {ascOrder}
  bind:currFile
/> -->
