<script lang="ts">
  import { isImg } from 'src/Utility'
  import DiHtml5 from 'svelte-icons/di/DiHtml5.svelte'
  import FaFile from 'svelte-icons/fa/FaFile.svelte'
  import FaFileAudio from 'svelte-icons/fa/FaFileAudio.svelte'
  import FaFileCode from 'svelte-icons/fa/FaFileCode.svelte'
  import FaFileCsv from 'svelte-icons/fa/FaFileCsv.svelte'
  import FaFileExcel from 'svelte-icons/fa/FaFileExcel.svelte'
  import FaFileImage from 'svelte-icons/fa/FaFileImage.svelte'
  import FaFilePdf from 'svelte-icons/fa/FaFilePdf.svelte'
  import FaFilePowerpoint from 'svelte-icons/fa/FaFilePowerpoint.svelte'
  import FaFileVideo from 'svelte-icons/fa/FaFileVideo.svelte'
  import FaFileWord from 'svelte-icons/fa/FaFileWord.svelte'
  import FaStickyNote from 'svelte-icons/fa/FaStickyNote.svelte'
  import { ICON } from 'src/Constants'

  export let path: string
</script>

{#if !path.endsWith('.md')}
  <span class={ICON}>
    {#if isImg(path)}
      <FaFileImage />
    {:else if path.endsWith('.html')}
      <DiHtml5 />
    {:else if path.endsWith('.xls') || path.endsWith('.xlsx')}
      <FaFileExcel />
    {:else if path.endsWith('.csv')}
      <FaFileCsv />
    {:else if path.endsWith('.pdf')}
      <FaFilePdf />
    {:else if path.endsWith('.txt')}
      <FaStickyNote />
    {:else if path.endsWith('.mp3') || path.endsWith('opus')}
      <FaFileAudio />
    {:else if path.endsWith('.mp4') || path.endsWith('.webm')}
      <FaFileVideo />
    {:else if path.endsWith('.docx') || path.endsWith('.doc')}
      <FaFileWord />
    {:else if path.endsWith('.ppt') || path.endsWith('.pptx')}
      <FaFilePowerpoint />
    {:else if path.endsWith('.js') || path.endsWith('.ts') || path.endsWith('.c') || path.endsWith('.py')}
      <FaFileCode />
    {:else}
      <FaFile />
    {/if}
  </span>
{/if}
