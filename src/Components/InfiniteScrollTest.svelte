<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  export let threshold: number = 0;
  export let horizontal: boolean = false;
  export let elementScroll: HTMLElement | null = null;
  export let hasMore: boolean = true;
  export let reverse: boolean = false;
  export let window: boolean = false;
  const dispatch = createEventDispatcher<{ loadMore: never }>();
  let isLoadMore: boolean = false;
  let component: HTMLElement;
  let beforeScrollHeight: number;
  let beforeScrollTop: number;
  let element: any | null;
  $: if (element) {
    if (reverse) {
      element.scrollTop = element.scrollHeight;
    }
    console.log("adding event listener")
    console.log({element})
    element.addEventListener("scroll", onScroll);
    element.addEventListener("resize", onScroll);
  }
  $: if (isLoadMore && reverse) {
    element.scrollTop =
      element.scrollHeight - beforeScrollHeight + beforeScrollTop;
  }
  const onScroll = (e: Event) => {
    // console.log("Checking if has more")
    if (!hasMore) return;
    const target = e.target as HTMLElement;
    const offset = calcOffset(target, reverse, horizontal);
    // console.log({target, offset})
    if (offset <= threshold) {
      if (!isLoadMore && hasMore) {
        dispatch("loadMore");
        beforeScrollHeight = target.scrollHeight;
        beforeScrollTop = target.scrollTop;
      }
      isLoadMore = true;
    } else {
      isLoadMore = false;
    }
  };
  const calcOffset = (target: any, reverse: boolean, horizontal: boolean) => {
    const element: HTMLElement = target.documentElement
      ? target.documentElement
      : target;
    if (reverse) {
      return horizontal ? element.scrollLeft : element.scrollTop;
    }
    return horizontal
      ? element.scrollWidth - element.clientWidth - element.scrollLeft
      : element.scrollHeight - element.clientHeight - element.scrollTop;
  };
  onMount(() => {
    if (window) {
      element = document;
    } else if (elementScroll) {
      element = elementScroll;
    } else {
      element = component.parentNode;
    }
  });
  onDestroy(() => {
    if (element) {
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("resize", onScroll);
    }
  });
</script>

{#if !window && !elementScroll}
  <div bind:this={component} id="svelte-infinite-scroll" style="width: 0;" />
{/if}