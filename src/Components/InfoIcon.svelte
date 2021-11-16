<script lang="ts">
  import type { SubtypeInfo } from 'src/Interfaces'
  import FaRegQuestionCircle from 'svelte-icons/fa/FaRegQuestionCircle.svelte'

  export let currSubtypeInfo: SubtypeInfo

  const { anl, desc } = currSubtypeInfo
</script>

<div class="icon" aria-label={`Type: ${anl}\n\n${desc}`}>
  <FaRegQuestionCircle />
</div>

<style>
  .icon {
    color: var(--text-normal);
    width: 20px;
    height: 20px;
    display: inline-block;
    padding-top: 3px !important;
  }
</style>
