<script lang="ts">
  import type { App } from 'obsidian'
  import type AnalysisView from 'src/AnalysisView'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import { debug, getPromiseResults } from 'src/Utility'
  import { onMount } from 'svelte'
  import ResultsMapTable from './ResultsMapTable.svelte'
  import SubtypeOptions from './SubtypeOptions.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let currSubtype: Subtype

  let { resolvedLinks } = app.metadataCache

  let frozen = false
  let currFile = app.workspace.getActiveFile()
  $: currNode = currFile?.path
  app.workspace.on('active-leaf-change', () => {
    if (!frozen) {
      currFile = app.workspace.getActiveFile()
    }
  })

  let ascOrder = false
  $: promiseSortedResults = getPromiseResults(
    app,
    plugin,
    currNode,
    currSubtype,
    resolvedLinks,
    ascOrder
  )
  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { promiseSortedResults })
  })

  let { noInfinity, noZero } = settings
</script>

<SubtypeOptions
  bind:currSubtype
  bind:noZero
  bind:ascOrder
  bind:frozen
  bind:currFile
  anl="Link Prediction"
  {plugin}
  {view}
/>

<ResultsMapTable
  {app}
  {view}
  {promiseSortedResults}
  {currNode}
  {noInfinity}
  {noZero}
/>

<style>
</style>
