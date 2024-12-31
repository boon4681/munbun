<script lang="ts">
    import { onMount, setContext } from "svelte";
    import { goto } from "$app/navigation";
    import { url } from "$lib/route";
    import { page } from "$app/stores";
    import { writable } from "svelte/store";
    import { client, type User } from "@/api";
    import { me } from "@/store";
    let isLoading = true;
    const load = async () => {
        const data = await client.GetMe();
        me.set(data);
    };
    onMount(async () => {
        await load();
        isLoading = false;
    });
</script>

<svelte:window on:focus={load} />

{#if !isLoading}
    <slot></slot>
{/if}
