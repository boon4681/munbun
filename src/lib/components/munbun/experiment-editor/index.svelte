<script lang="ts">
	import "./style.scss";
	import { onMount, onDestroy } from "svelte";
	import { browser } from "$app/environment";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
	import Placeholder from "@tiptap/extension-placeholder";
	import TaskList from "@tiptap/extension-task-list";
	import TaskItem from "@tiptap/extension-task-item";
	import Link from "@tiptap/extension-link";
	import { Color } from "@tiptap/extension-color";
	import ListItem from "@tiptap/extension-list-item";
	import TextStyle from "@tiptap/extension-text-style";
	import suggestion from "./extensions/suggestion";
	import Commands from "./extensions/command";
	import CommandList from "./CommandList.svelte";
	import { slashVisible, slashItems, slashProps, editorWidth } from "@/store";
	import { client } from "@/api";
	export let content = {};
	let output = "";
	let iframe: HTMLIFrameElement;

	let selectedIndex = 0;
	$: selectedIndex = $slashVisible ? selectedIndex : 0;
	$: editorWidth.set(w ? w : 0);

	function handleKeydown(event: any) {
		if (!$slashVisible) return;
		if (event.key === "ArrowUp") {
			event.preventDefault();

			upHandler();
			return true;
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();

			downHandler();
			return true;
		}

		if (event.key === "Enter") {
			event.preventDefault();
			enterHandler();
			return true;
		}

		return false;
	}

	function upHandler() {
		selectedIndex = (selectedIndex + $slashItems.length - 1) % $slashItems.length;
	}

	function downHandler() {
		selectedIndex = (selectedIndex + 1) % $slashItems.length;
	}

	function enterHandler() {
		selectItem(selectedIndex);
	}
	function selectItem(index: any) {
		const item = $slashItems[index] as any;

		if (item) {
			//editor.chain().focus().toggleBold().run();
			//return console.log(item);
			let range = $slashProps.range;
			item.command({ editor, range });
		}
	}

	let element: HTMLElement;
	let editor: Editor;
	let w: number = 0;

	onMount(() => {
		if (browser) {
			editor = new Editor({
				element: element,
				editorProps: {
					attributes: {
						class: "outline-none",
					},
				},
				extensions: [
					StarterKit,
					Placeholder,
					TaskList,
					TaskItem,
					Color.configure({ types: [TextStyle.name, ListItem.name] }),
					// TextStyle.configure(),
					Link,
					Commands.configure({
						suggestion,
					}),
				],
				content,
				onTransaction: () => {
					// force re-render so `editor.isActive` works as expected
					editor = editor;
				},
				onUpdate: ({ editor }) => {
					client
						.RenderTemplate({
							json: editor.getText(),
						})
						.then((a) => {
							output = a;
							iframe!.contentWindow!.document.open();
							iframe!.contentWindow!.document.write(output);
							iframe!.contentWindow!.document.close();
						});
				},
			});
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	onMounSaveTemplate{});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="border rounded">
	<div class="border-b px-4 py-2">Template Editor</div>
	<div class="p-4">
		<div bind:this={element} on:keydown|capture={handleKeydown}></div>
		<CommandList {selectedIndex} />
	</div>
</div>

<iframe class="bg-white w-full" bind:this={iframe} title="Email preview"></iframe>
