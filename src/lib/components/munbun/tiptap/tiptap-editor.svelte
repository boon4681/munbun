<script lang="ts">
    import { onDestroy, type Snippet } from "svelte";
    import {
        TiptapEditorContext,
        TiptapElementRefContext,
        TiptapJSONOutputContext,
        TiptapTextOutputContext,
        TiptapValueContext,
    } from "./context";
    import { writable } from "svelte/store";
    import { watch } from "runed";
    import { Editor, NodeView } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import TextStyle from "@tiptap/extension-text-style";
    import Underline from "@tiptap/extension-underline";
    import type { HTMLAttributes } from "svelte/elements";
    import Placeholder from "@tiptap/extension-placeholder";
    import GlobalDragHandle from "tiptap-extension-global-drag-handle";

    import { cn } from "$lib/utils";
    import defaultSuggestion from "./extensions/slash-command/default-suggestion";
    import { SectionNode } from "./nodes";
    import { TrailingNode } from "./extensions/trailing-node/trailing-node";
    import { SlashCommandExtension } from "./extensions/slash-command/slash-command";

    let editor = TiptapEditorContext.get();
    let value = TiptapValueContext.get();
    let element = TiptapElementRefContext.get();
    let json_output = TiptapJSONOutputContext.get();
    let text_output = TiptapTextOutputContext.get();

    interface Props extends HTMLAttributes<HTMLDivElement> {
        placeholder?: string;
    }

    let { class: className, placeholder, ...restProps }: Props = $props();

    watch(
        () => $element,
        () => {
            if ($element) {
                $editor = new Editor({
                    element: $element,
                    extensions: [
                        StarterKit,
                        TextStyle,
                        Underline,
                        Placeholder.configure({
                            placeholder: ({ node }) => {
                                if (node.type.name === "heading") {
                                    return `Heading ${node.attrs.level}`;
                                }
                                return "Press '/' for commands";
                            },
                            includeChildren: true,
                        }),
                        SectionNode,
                        TrailingNode,
                        SlashCommandExtension.configure({
                            suggestion: defaultSuggestion as any,
                        }),
                        GlobalDragHandle,
                    ],
                    content: $value,
                    onTransaction: () => {
                        // force re-render so `editor.isActive` works as expected
                        $editor = $editor;
                        console.log($editor.isFocused);
                    },
                    onUpdate({ editor }) {
                        $json_output = editor.getJSON();
                        $text_output = editor.getText();
                    },
                    editorProps: {
                        attributes: {
                            class: "p-6",
                        },
                    },
                });
                $json_output = $editor.getJSON();
                $text_output = $editor.getText();
            }
        },
    );

    onDestroy(() => {
        if ($editor) {
            $editor.destroy();
            //@ts-ignore
            $editor = null;
        }
    });
</script>

<div class={cn(className)} {...restProps} bind:this={$element}></div>
