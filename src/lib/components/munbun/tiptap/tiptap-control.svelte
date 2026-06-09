<script lang="ts">
    import type { Snippet } from "svelte";
    import { TiptapEditorContext, TiptapJSONOutputContext } from "./context";
    import type { HTMLAttributes } from "svelte/elements";
    interface Props extends HTMLAttributes<HTMLDivElement> {
        children?: Snippet;
    }
    let { children, ...rests }: Props = $props();
    let editor = TiptapEditorContext.get();
    let rerender = TiptapJSONOutputContext.get();
</script>

<div {...rests}>
    {#if $editor}
        {#key $editor}
            {@render children?.()}
        {/key}
    {/if}
</div>
