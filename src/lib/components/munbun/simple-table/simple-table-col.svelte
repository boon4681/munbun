<script lang="ts">
    import { cn } from "@/utils";

    let className: string = "";
    export let value: string = "";
    export let edit: boolean = false;
    export { className as class };
</script>

<div class={cn("flex items-center w-full p-4 border-b border-blue-gray-100 bg-blue-gray-50 border-r", edit ? "p-0" : "", className)}>
    {#if edit}
        <input
            bind:value
            class="w-full bg-background p-4 block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70"
        />
    {:else}
        <p class="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
            <slot></slot>
        </p>
    {/if}
</div>
