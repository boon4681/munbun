import type { Content, Editor, JSONContent } from "@tiptap/core";
import { Context } from "runed";
import type { Writable } from "svelte/store";

export const TiptapEditorContext = new Context<Writable<Editor>>("tiptap.editor");
export const TiptapElementRefContext = new Context<Writable<HTMLElement>>("tiptap.ref");
export const TiptapValueContext = new Context<Writable<Content>>("tiptap.value");
export const TiptapJSONOutputContext = new Context<Writable<JSONContent>>("tiptap.output.json");
export const TiptapTextOutputContext = new Context<Writable<string>>("tiptap.output.text");