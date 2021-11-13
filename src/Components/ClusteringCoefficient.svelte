<!-- <script lang="ts">
  import type { App } from 'obsidian'
  import type AnalysisView from 'src/AnalysisView'
  import type { GraphAnalysisSettings, Subtype } from 'src/Interfaces'
  import type GraphAnalysisPlugin from 'src/main'
  import { getPromiseResults } from 'src/Utility'
  import { onMount } from 'svelte'
  import ResultsMapTable from './ResultsMapTable.svelte'
  import SubtypeOptions from './SubtypeOptions.svelte'

  export let app: App
  export let plugin: GraphAnalysisPlugin
  export let settings: GraphAnalysisSettings
  export let view: AnalysisView
  export let currSubtype: Subtype

  let { resolvedLinks } = app.metadataCache

  let ascOrder = false
  let frozen = false
  let currFile = app.workspace.getActiveFile()
  $: currNode = currFile?.path
  app.workspace.on('active-leaf-change', () => {
    if (!frozen) {
      currFile = app.workspace.getActiveFile()
    }
  })

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
  })

  let { noZero, noInfinity } = settings
</script>

<SubtypeOptions
  {plugin}
  {view}
  anl="Community Detection"
  bind:currSubtype
  bind:ascOrder
  bind:frozen
  bind:currFile
/>

<ResultsMapTable
  {app}
  {view}
  {promiseSortedResults}
  {currNode}
  bind:noZero
  bind:noInfinity
/>

<style>
</style> -->
