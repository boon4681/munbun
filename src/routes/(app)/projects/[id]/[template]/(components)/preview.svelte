<script lang="ts">
    let { preview = "" }: { preview?: string } = $props();
    let iframe: HTMLIFrameElement;

    $effect(() => {
        if (!iframe?.contentWindow) return;
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(preview);
        doc.close();
    });
</script>

<iframe class="h-150 w-full bg-white" bind:this={iframe} title="Email preview"></iframe>
