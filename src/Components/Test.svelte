<script lang="ts">
  import { SUBTYPES } from 'src/constants'
</script>

<div class="container">
  {#each SUBTYPES as subtype}
    <span class="item {subtype.global ? 'GA-Global' : ''}"
      >{subtype.subtype}</span
    >
  {/each}
</div>

<style>
  .container {
    overflow: auto;
    white-space: nowrap;
  }

  .item {
    display: inline-block;
    border: 1px solid transparent;
    background-color: var(--background-primary-alt);
    border-radius: 10px;
    color: var(--text-normal);
    text-align: center;
    padding: 2px 4px;
    margin: 0px 3px;
    width: fit-content;
  }

  .container > span:last-child {
    margin-right: 10px;
  }
  .container > span:first-child {
    margin-left: 10px;
  }

  .item:hover {
    background-color: var(--interactive-accent);
  }
</style>
