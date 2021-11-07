<script lang="ts">
  import FaRegQuestionCircle from 'svelte-icons/fa/FaRegQuestionCircle.svelte'

  export let desc: string
</script>

<div class="icon" aria-label={desc}>
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
