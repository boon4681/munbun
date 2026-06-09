<script lang="ts">
    import { get } from "svelte/store";
    import { TiptapEditorContext } from "../context";
    import Underline from "lucide-svelte/icons/underline";
    import PrivateToggle from "../private-toggle.svelte";

    let editor = TiptapEditorContext.get();
</script>

<PrivateToggle
    aria-label="toggle underline"
    pressed={$editor.isActive("underline")}
    onclick={() => $editor.chain().focus().toggleUnderline().run()}
>
    <Underline class="size-4" />
</PrivateToggle>
