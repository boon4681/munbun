<script lang="ts">
	import { onMount, onDestroy, type Snippet } from "svelte";
	import { Editor, type Content, type JSONContent } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import TextStyle from "@tiptap/extension-text-style";
	import "./tiptap.css"
	import {
		TiptapEditorContext,
		TiptapElementRefContext,
		TiptapJSONOutputContext,
		TiptapTextOutputContext,
		TiptapValueContext,
	} from "./context";
	import { watch } from "runed";
	import { writable } from "svelte/store";
	let editor = writable<Editor>();
	let element = writable<HTMLElement>();
	let value = writable<Content>();
	let text = writable<string>();
	let json = writable<JSONContent>();
	TiptapEditorContext.set(editor);
	TiptapElementRefContext.set(element);
	TiptapValueContext.set(value);
	TiptapJSONOutputContext.set(json);
	TiptapTextOutputContext.set(text);

	interface Props {
		children?: Snippet;
		defaultValue?: Content;
		onchange?: (doc: { json: JSONContent; text: string }) => void;
	}
	let { children, defaultValue, onchange }: Props = $props();
	value.set(defaultValue ?? "");
	text.set("");

	watch(
		() => {
			$json;
			$text;
		},
		() => {
			onchange?.({ json: $json, text: $text });
		},
	);

	onDestroy(() => {
		if ($editor) {
			$editor.destroy();
		}
	});
</script>

{@render children?.()}
