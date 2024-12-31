<script lang="ts">
    import { onMount } from "svelte";

    export let preview: string = "";
    let iframe: HTMLIFrameElement;

    onMount(() => {
        iframe!.contentWindow!.document.open();
        iframe!.contentWindow!.document.write(preview);
        iframe!.contentWindow!.document.close();
    });
</script>

<iframe class="bg-white w-full h-[600px]" bind:this={iframe} title="Email preview"></iframe>
