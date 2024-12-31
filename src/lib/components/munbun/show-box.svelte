<script lang="ts">
    import { cn } from "@/utils";
    import Copy from "lucide-svelte/icons/copy";
    import CopyCheck from "lucide-svelte/icons/copy-check";
    import Eye from "lucide-svelte/icons/eye";
    import EyeOff from "lucide-svelte/icons/eye-off";
    let className: string = "";
    export let show = false;
    export let placeholder = "";
    export { className as class };

    let copied = false;
    let container: HTMLElement;
    const copy = () => {
        if (copied) return;
        let copyText: HTMLInputElement = document.createElement("input");
        copyText.style.position = "fixed";
        copyText.style.left = "-9999px";
        copyText.value = container.textContent!;
        document.body.appendChild(copyText);
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
        navigator.clipboard.writeText(copyText.value).then(
            function () {
                console.log("Async: Copying to clipboard was successful!");
            },
            function (err) {
                console.error("Async: Could not copy text: ", err);
            },
        );
        copyText.remove();
        copied = true;
        setTimeout(() => {
            show = false;
            copied = false;
        }, 1000);
    };
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class={cn(
        "text-sm h-8 max-w-[200px] min-w-0 w-full overflow-hidden text-nowrap border my-2 border-muted-foreground/60 rounded-md",
        className,
    )}
>
    <div class="flex h-full items-center gap-2 relative">
        <div
            on:click={copy}
            role="button"
            class="shrink-0 hover:bg-foreground transition-all rounded hover:text-background p-1 size-6 ml-2"
        >
            {#if !copied}
                <Copy class="size-full" strokeWidth={1}></Copy>
            {:else}
                <CopyCheck class="size-full" strokeWidth={1}></CopyCheck>
            {/if}
        </div>
        <div
            bind:this={container}
            class:pointer-events-none={!show}
            class="py-2 text-muted-foreground text-ellipsis w-full overflow-hidden"
        >
            <slot></slot>
        </div>
        <div
            class:hidden={show}
            class="absolute top-0 left-0 backdrop-blur flex px-4 items-center size-full bg-foreground/10"
        >
            {placeholder}
        </div>
        <div
            role="button"
            on:click={() => (show = !show)}
            class="relative shrink-0 hover:bg-foreground transition-all rounded hover:text-background p-1 size-6 mr-1"
        >
            {#if !show}
                <EyeOff class="size-full" strokeWidth={1}></EyeOff>
            {:else}
                <Eye class="size-full" strokeWidth={1}></Eye>
            {/if}
        </div>
    </div>
</div>
