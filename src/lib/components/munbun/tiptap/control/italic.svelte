<script lang="ts">
    import { get } from "svelte/store";
    import { TiptapEditorContext } from "../context";
    import Italic from "lucide-svelte/icons/italic";
    import PrivateToggle from "../private-toggle.svelte";

    let editor = TiptapEditorContext.get();
</script>

<PrivateToggle
    aria-label="toggle italic"
    pressed={$editor.isActive("italic")}
    onclick={() => $editor.chain().focus().toggleItalic().run()}
>
    <Italic class="size-4" />
</PrivateToggle>
