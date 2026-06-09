<script lang="ts">
    import { TiptapEditorContext } from "../context";
    import Bold from "lucide-svelte/icons/bold";
    import PrivateToggle from "../private-toggle.svelte";

    let editor = TiptapEditorContext.get();
</script>

<PrivateToggle
    aria-label="toggle bold"
    pressed={$editor.isActive("bold")}
    onclick={() => $editor.chain().focus().toggleBold().run()}
>
    <Bold class="size-4" />
</PrivateToggle>
