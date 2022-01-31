<script lang="ts">
  import { onMount } from 'svelte'
  import { App, MarkdownRenderer } from 'obsidian'
  export let sentence: string[]
  export let sourcePath: string
  export let app: App
  export let line: number
  import { jumpToSelection, openOrSwitch } from 'src/Utility'

  let renderedSentence = sentence[0] + '==' + sentence[1] + '==' + sentence[2]
  if (sentence.length === 5) {
    renderedSentence =
      renderedSentence + '==' + sentence[3] + '==' + sentence[4]
  }
  renderedSentence = renderedSentence.trim()

  let el: HTMLElement
  onMount(async () => {
    MarkdownRenderer.renderMarkdown(renderedSentence, el, sourcePath, null)
    for (let markedEl of el.getElementsByTagName('mark')) {
      markedEl.classList.add('CC-mark')
    }
    for(let markedEl:HTMLElement of el.getElementsByTagName("ol")) {
      markedEl.classList.add("CC-edit")
    }
    for(let markedEl:HTMLElement of el.getElementsByTagName("hr")) {
      markedEl.classList.add("CC-hr")
    }
  })
</script>

<div
  class="CC-sentence"
  bind:this={el}
  on:click={async (e) => {
    await openOrSwitch(app, sourcePath, e)
    jumpToSelection(app, line, sentence.join(''))
  }}
/>

<style>
  .CC-sentence {
    padding-left: 40px;
    color: var(--text-muted);
  }
</style>
