<script lang="ts">
    import { TiptapEditorContext } from "../context";
    import List from "lucide-svelte/icons/list";
    import PrivateToggle from "../private-toggle.svelte";

    let editor = TiptapEditorContext.get();
</script>

<PrivateToggle
    aria-label="toggle bullet-list"
    pressed={$editor.isActive("bulletList")}
    onclick={() => $editor.chain().focus().toggleBulletList().run()}
>
    <List class="size-4" />
</PrivateToggle>
