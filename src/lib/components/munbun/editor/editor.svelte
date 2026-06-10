<script lang="ts">
    import { onMount } from "svelte";
    import { EditorView, basicSetup } from "codemirror";
    import { indentWithTab } from "@codemirror/commands";
    import { lineNumbers, keymap } from "@codemirror/view";
    import { indentUnit } from "@codemirror/language";
    import { oneDark } from "@codemirror/theme-one-dark";
    import { xml } from "@codemirror/lang-xml";
    import { client } from "$lib/api";

    let {
        preview = $bindable(""),
        project,
        name,
        doc = "",
        status = $bindable<"idle" | "saving" | "saved" | "error">("idle"),
    }: {
        preview?: string;
        project: string;
        name: string;
        doc?: string;
        status?: "idle" | "saving" | "saved" | "error";
    } = $props();

    let main: HTMLElement;
    let iframe: HTMLIFrameElement;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const render = (html: string) => {
        preview = html;
        if (!iframe?.contentWindow) return;
        const d = iframe.contentWindow.document;
        d.open();
        d.write(html);
        d.close();
    };

    const save = async (mjml: string) => {
        status = "saving";
        try {
            const res = await client()
                .template[":project"][":name"].save.$post({
                    param: { project, name },
                    json: { mjml },
                });
            const json = await res.json();
            render(("data" in json ? json.data : "") ?? "");
            status = "saved";
        } catch {
            status = "error";
        }
    };

    onMount(() => {
        const editor = new EditorView({
            doc,
            extensions: [
                basicSetup,
                xml(),
                lineNumbers(),
                indentUnit.of("    "),
                keymap.of([indentWithTab]),
                EditorView.theme({
                    "&.cm-editor": { height: "100%" },
                    ".cm-scroller": { overflow: "auto" },
                }),
                oneDark,
                EditorView.updateListener.of((v) => {
                    if (!v.docChanged) return;
                    const next = v.state.doc.toString();
                    clearTimeout(timer);
                    timer = setTimeout(() => save(next), 400);
                }),
            ],
            parent: main,
        });
        // initial preview render
        save(doc ?? "");
        return () => {
            clearTimeout(timer);
            editor.destroy();
        };
    });
</script>

<div class="rounded border">
    <div class="flex items-center justify-between border-b px-4 py-2">
        <span>Template Editor</span>
        <span class="text-xs text-muted-foreground">
            {#if status === "saving"}Saving…{:else if status === "saved"}Saved{:else if status === "error"}Save failed{/if}
        </span>
    </div>
    <div class="flex w-full flex-col xl:flex-row">
        <div class="w-full border-r xl:w-1/2 xl:max-w-1/2">
            <div class="relative max-h-[600px] min-h-[600px] overflow-auto">
                <div class="h-full w-full" bind:this={main}></div>
            </div>
        </div>
        <iframe
            class="h-[600px] w-full bg-white xl:w-1/2 xl:max-w-1/2"
            bind:this={iframe}
            title="Email preview"
        ></iframe>
    </div>
</div>
