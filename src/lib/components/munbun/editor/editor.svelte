<script lang="ts">
    import { EditorView, basicSetup } from "codemirror";
    import { indentWithTab } from "@codemirror/commands";
    import { lineNumbers, keymap } from "@codemirror/view";
    import { indentUnit, foldGutter } from "@codemirror/language";
    import { lintGutter, linter } from "@codemirror/lint";
    import { createEventDispatcher, onMount } from "svelte";
    import { github_dark_fake } from "./editor/theme.js";
    import { parse } from "./lang/grammar.js";
    import { beautifySql } from "./lang/formatter.js";
    import { oneDark, oneDarkTheme } from "@codemirror/theme-one-dark";
    import { xml } from "@codemirror/lang-xml";
    import { client } from "@/api.js";
    const dispatch = createEventDispatcher();
    let main: HTMLElement;
    let iframe: HTMLIFrameElement;
    export let preview: string;
    export let project: string;
    export let name: string;
    export let doc: string = ``;
    export let extensions: any[] = [];
    onMount(() => {
        let editor = new EditorView({
            doc,
            extensions: [
                basicSetup,
                xml(),
                ...extensions,
                lineNumbers(),
                indentUnit.of("    "),
                // foldGutter(),
                // lintGutter(),
                keymap.of([indentWithTab]),
                EditorView.theme({
                    "&.cm-editor": { height: "100%" },
                    ".cm-scroller": { overflow: "auto" },
                }),
                oneDark,
                // github_dark_fake,
                EditorView.updateListener.of((v) => {
                    doc = v.state.doc.toString();
                    client
                        .SaveTemplate({
                            param: {
                                project,
                                name,
                            },
                            json: {
                                mjml: doc,
                            },
                        })
                        .then((a) => {
                            preview = a
                            iframe!.contentWindow!.document.open();
                            iframe!.contentWindow!.document.write(a);
                            iframe!.contentWindow!.document.close();
                        });
                }),
            ],
            parent: main,
        });
    });
</script>

<div class="border rounded">
    <div class="border-b px-4 py-2">Template Editor</div>
    <div class="w-full flex flex-col xl:flex-row">
        <div class="w-full xl:w-1/2 xl:max-w-1/2 border-r">
            <div class="h-full max-h-[600px] min-h-[600px] relative overflow-auto">
                <div class="w-full h-full" bind:this={main}></div>
            </div>
        </div>
        <iframe class="bg-white w-full xl:w-1/2 xl:max-w-1/2 h-[600px]" bind:this={iframe} title="Email preview"></iframe>
    </div>
</div>
