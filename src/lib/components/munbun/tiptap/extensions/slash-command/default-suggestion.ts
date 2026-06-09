import type { Editor, Range } from '@tiptap/core';
import tippy, { type Instance, type Props as TippyProps } from 'tippy.js';
import CommandsList from './slash-command-list.svelte'; // Import the Svelte component
import { mount, unmount } from 'svelte';

interface CommandItem {
	title: string;
	/** The function to execute when the command is selected. */
	command: ({ editor, range }: { editor: Editor; range: Range }) => void;
	/** Allows for any other properties Tiptap might need if using props.command(itemData). */
	[key: string]: any;
}
export default {
	//@ts-ignore
	items: ({ query }) => {
		return ([
			{
				title: 'Heading 1',
				subtitle: 'BIG heading',
				command: ({ editor, range }) => {
					editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
				}
			},
			{
				title: 'Heading 2',
				subtitle: 'Less Big heading',
				command: ({ editor, range }) => {
					editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
				}
			},
			{
				title: 'Heading 3',
				subtitle: 'Medium big heading',
				command: ({ editor, range }) => {
					editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
				}
			},
			{
				title: 'Section',
				subtitle: 'Medium big heading',
				command: ({ editor, range }) => {
					//@ts-ignore
					editor.chain().focus().deleteRange(range).setMunbunSectionNode().run();
				}
			}
		] satisfies CommandItem[])
			.filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
			.slice(0, 10);
	},

	render: () => {
		let component: CommandsList | null = null;
		let popup: Instance<TippyProps>[] | null = null;
		let componentElement: HTMLElement | null = null;

		const svelteContainer = document.createElement('div');
		return {
			onStart: (props: { editor: Editor; range: Range; clientRect?: () => DOMRect; items: CommandItem[] }) => {
				if (componentElement) {
					svelteContainer.innerHTML = '';
				}
				component = mount(CommandsList, {
					target: svelteContainer,
					props: {
						editor: props.editor,
						range: props.range,
						items: props.items,
						command: (item: CommandItem) => {
							item.command({ editor: props.editor, range: props.range });
							// Optionally hide popup after command execution
							if (popup && popup[0]) {
								popup[0].hide();
							}
						}
					}
				})

				popup = tippy('body', {
					getReferenceClientRect: props.clientRect,
					appendTo: () => document.body,
					content: svelteContainer,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start'
				});
			},

			onUpdate: (props: { editor: Editor; range: Range; clientRect?: () => DOMRect; items: CommandItem[] }) => {
				if (component && component.$set) { // Check if $set exists (it does for Svelte 5 components)
					component.$set({
						editor: props.editor,
						range: props.range,
						items: props.items
					});
				}

				if (!props.clientRect) {
					return;
				}

				if (popup && popup[0]) {
					popup[0].setProps({
						getReferenceClientRect: props.clientRect
					});
				}
			},

			onKeyDown: (props: { event: KeyboardEvent }): boolean => {
				if (props.event.key === 'Escape') {
					if (popup && popup[0]) {
						popup[0].hide();
					}
					return true;
				}

				// Delegate to the Svelte component's onKeyDown method
				if (component && typeof component.onKeyDown === 'function') {
					return component.onKeyDown(props);
				}
				return false;
			},

			onExit: () => {
				if (popup && popup[0]) {
					popup[0].destroy();
					popup = null;
				}
				if (component) {
					unmount(component)
					component = null;
				}
				// Clean up the temporary container if needed, though typically it's empty after $destroy
				if (svelteContainer) {
					svelteContainer.innerHTML = '';
				}
				componentElement = null;
			}
		};
	}
};