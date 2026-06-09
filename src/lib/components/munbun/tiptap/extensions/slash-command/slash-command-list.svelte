<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import { tick } from 'svelte';

	type Item = {
		title: string;
		command: (props: { editor: Editor; range: any }) => void;
	};

	let { items, editor, range, command }: { items: Item[]; editor: Editor; range: any; command: (item: Item) => void } = $props();

	let selectedIndex = $state(0);
	let commandListElement = $state<HTMLDivElement | null>(null);

	const selectItem = (index: number) => {
		const item = items[index];
		if (item) {
			command(item);
		}
	};

	const upHandler = () => {
		selectedIndex = (selectedIndex + items.length - 1) % items.length;
		scrollToSelected();
	};

	const downHandler = () => {
		selectedIndex = (selectedIndex + 1) % items.length;
		scrollToSelected();
	};

	const enterHandler = () => {
		selectItem(selectedIndex);
	};

	const scrollToSelected = async () => {
		await tick(); // Ensure DOM is updated
		if (commandListElement) {
			const selectedButton = commandListElement.children[selectedIndex] as HTMLElement;
			if (selectedButton) {
				selectedButton.scrollIntoView({ block: 'nearest' });
			}
		}
	};

	// Expose onKeyDown to the parent for Tiptap's suggestion utility
	export const onKeyDown = ({ event }: { event: KeyboardEvent }): boolean => {
		if (event.key === 'ArrowUp') {
			upHandler();
			return true;
		}
		if (event.key === 'ArrowDown') {
			downHandler();
			return true;
		}
		if (event.key === 'Enter') {
			enterHandler();
			return true;
		}
		return false;
	};

	$effect(() => {
		// Reset index if items change
		selectedIndex = 0;
		scrollToSelected();
	});
</script>

{#if items.length}
	<div class="items" bind:this={commandListElement}>
		{#each items as item, index (item.title)}
			<button
				class="item {index === selectedIndex ? 'is-selected' : ''}"
				type="button"
				onclick={() => selectItem(index)}
			>
				{item.title}
			</button>
		{/each}
	</div>
{:else}
	<div class="item">No result</div>
{/if}

<style>
	.items {
		position: relative;
		border-radius: 0.5rem;
		background: #fff;
		color: rgba(0, 0, 0, 0.8);
		overflow: hidden;
		font-size: 0.9rem;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.05),
			0px 10px 20px rgba(0, 0, 0, 0.1);
		padding: 0.2rem;
		max-height: 200px; /* Or any desired max height */
		overflow-y: auto;
	}

	.item {
		display: block;
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.item.is-selected,
	.item:hover {
		background-color: #0d0d0d0d; /* A light background for selection/hover */
	}
</style>