<script lang="ts">
    import { cn } from "$lib/utils";
    import type { Snippet } from "svelte";
    import Copy from "@lucide/svelte/icons/copy";
    import CopyCheck from "@lucide/svelte/icons/copy-check";
    import Eye from "@lucide/svelte/icons/eye";
    import EyeOff from "@lucide/svelte/icons/eye-off";

    let {
        show = $bindable(false),
        placeholder = "",
        closeOnCopy = true,
        class: className = "",
        children,
    }: {
        show?: boolean;
        placeholder?: string;
        closeOnCopy?: boolean;
        class?: string;
        children: Snippet;
    } = $props();

    let copied = $state(false);
    let container: HTMLElement;

    const copy = async () => {
        if (copied) return;
        try {
            await navigator.clipboard.writeText(container.textContent ?? "");
        } catch {
            /* clipboard may be unavailable */
        }
        copied = true;
        setTimeout(() => {
            if (closeOnCopy) show = false;
            copied = false;
        }, 1000);
    };
</script>

<div
    class={cn(
        "my-2 h-8 w-full min-w-0 max-w-[200px] overflow-hidden text-nowrap rounded-md border border-muted-foreground/60 text-sm",
        className,
    )}
>
    <div class="relative flex h-full items-center gap-2">
        <button
            type="button"
            onclick={copy}
            class="ml-2 size-6 shrink-0 rounded p-1 transition-all hover:bg-foreground hover:text-background"
        >
            {#if !copied}
                <Copy class="size-full" strokeWidth={1} />
            {:else}
                <CopyCheck class="size-full" strokeWidth={1} />
            {/if}
        </button>
        <div
            bind:this={container}
            class:pointer-events-none={!show}
            class="w-full overflow-hidden text-ellipsis py-2 text-muted-foreground"
        >
            {@render children()}
        </div>
        <div
            class:hidden={show}
            class="absolute left-0 top-0 flex size-full items-center bg-foreground/10 px-4 backdrop-blur"
        >
            {placeholder}
        </div>
        <button
            type="button"
            onclick={() => (show = !show)}
            class="relative mr-1 size-6 shrink-0 rounded p-1 transition-all hover:bg-foreground hover:text-background"
        >
            {#if !show}
                <EyeOff class="size-full" strokeWidth={1} />
            {:else}
                <Eye class="size-full" strokeWidth={1} />
            {/if}
        </button>
    </div>
</div>
