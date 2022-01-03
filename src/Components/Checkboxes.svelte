<script lang="ts">
  import AnalysisView from '../AnalysisView'

  import type GraphAnalysisPlugin from '../main'

  export let plugin: GraphAnalysisPlugin
  export let settingName: string
  export let options: string[]
  let selected = plugin.settings[settingName] as string[]

  let toNone = selected.length === 0 ? false : true
  $: toNone = selected.length === 0 ? false : true

  async function save() {
    if (plugin.settings[settingName] === undefined) {
      return console.log(settingName + ' not found in BC settings')
    }

    plugin.settings[settingName] = selected
    await plugin.saveSettings()
  }
</script>

<div>
  <button
    on:click={async () => {
      if (toNone) selected = []
      else selected = options

      await save()
    }}
  >
    Select {toNone ? 'None' : 'All'}
  </button>
</div>

<div class="grid">
  {#each options as option}
    <div>
      <label>
        <input
          type="checkbox"
          value={option}
          bind:group={selected}
          on:change={async () => save()}
        />
        {option}
      </label>
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    /* grid-gap: 10px; */
  }
</style>
