<script lang="ts">
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

  let currSubtype: Subtype = 'Adamic Adar'
  let { resolvedLinks } = app.metadataCache

  $: currFile = app.workspace.getActiveFile()
  $: currNode = currFile?.path.split('.md', 1)[0]
  app.workspace.on('active-leaf-change', () => {
    currFile = app.workspace.getActiveFile()
  })

  $: promiseSortedResults = getPromiseResults(
    plugin,
    currNode,
    currSubtype,
    resolvedLinks
  )

  onMount(() => {
    currFile = app.workspace.getActiveFile()
    debug(settings, { promiseSortedResults })
  })

  let { noInfinity, noZero } = settings
</script>

<SubtypeOptions bind:currSubtype bind:noInfinity bind:noZero {anl} />

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
