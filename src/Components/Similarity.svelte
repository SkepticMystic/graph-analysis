<!-- <script lang="ts">
  import type { App } from 'obsidian'
  import type AnalysisView from 'src/AnalysisView'
  import type { Analyses, GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import { debug, getPromiseResults } from 'src/Utility'
  import { onMount } from 'svelte'
  import ResultsMapTable from './ResultsMapTable.svelte'
  import SubtypeOptions from './SubtypeOptions.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let anl: Analyses

  let currSubtype: Subtype = 'Jaccard'
  let currFile = app.workspace.getActiveFile()
  $: currNode = getCurrNode(currFile)
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  let { resolvedLinks } = app.metadataCache
  // $: subtype = 'Jaccard'
  let ascOrder = false
  $: promiseSortedResults = getPromiseResults(
    plugin,
    currNode,
    currSubtype,
    resolvedLinks,
    ascOrder
  )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    currSubtype = 'Jaccard'
    debug(settings, { promiseSortedResults })
  })

  let { noInfinity, noZero } = settings
</script>

<SubtypeOptions
  bind:currSubtype
  bind:noInfinity
  bind:noZero
  {anl}
  bind:ascOrder
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
</style> -->
