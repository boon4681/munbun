<script lang="ts">
    import { onMount } from "svelte";
    import { invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { client } from "$lib/api";
    import { highlight, type ShikiLang } from "$lib/shiki";
    import { init } from "@paralleldrive/cuid2";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import Editor from "$lib/components/munbun/editor/editor.svelte";
    import Preview from "./(components)/preview.svelte";
    import Deployment from "./(components)/deployment.svelte";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Trash2 from "@lucide/svelte/icons/trash-2";
    import Plus from "@lucide/svelte/icons/plus";
    import Copy from "@lucide/svelte/icons/copy";
    import Send from "@lucide/svelte/icons/send";

    let { data } = $props();

    type Variable = { id: string; name: string; value: string };

    let variables = $state<Variable[]>([]);
    let preview = $state("");
    let isDeploying = $state(false);
    let editorKey = $state(0);

    let testOpen = $state(false);
    let testEmail = $state("");
    let testSending = $state(false);

    const project = $derived(data.template.project);
    const name = $derived(data.template.name);
    const createShortId = init({ length: 8 });

    onMount(() => {
        variables = data.template.variables ?? [];
    });

    // Called after a deployment is restored: reload server data, reset the
    // variables table and re-mount the editor so it shows the restored MJML.
    const onRestored = async () => {
        await invalidateAll();
        variables = data.template.variables ?? [];
        editorKey++;
    };

    const sendTest = async () => {
        if (testSending || !testEmail.trim()) return;
        testSending = true;
        const to = testEmail.trim();
        const request = (async () => {
            const res = await client().template[":project"][":name"].test.$post({
                param: { project, name },
                json: { to },
            });
            const body = await res.json();
            const message = "message" in body ? body.message : res.ok ? "Sent" : "Failed to send";
            if (!res.ok) throw new Error(message);
            return message;
        })();
        toast.promise(request, {
            loading: `Sending test to ${to}…`,
            success: (message) => message,
            error: (e) => (e instanceof Error ? e.message : "Failed to send test email"),
        });
        try {
            await request;
            testOpen = false;
            testEmail = "";
        } catch {
            /* surfaced by the toast */
        } finally {
            testSending = false;
        }
    };

    const saveVariables = async () => {
        await client().template[":project"][":name"].save.$post({
            param: { project, name },
            json: { variables: $state.snapshot(variables) },
        });
    };

    const add = async () => {
        variables.push({ id: createShortId(), name: "", value: "" });
        await saveVariables();
    };

    const remove = async (id: string) => {
        variables = variables.filter((a) => a.id !== id);
        await saveVariables();
    };

    const json = () => {
        const kv: Record<string, string> = {};
        for (const v of variables) kv[v.name] = v.value ?? "";
        return kv;
    };

    const deploy = async () => {
        if (isDeploying) return;
        isDeploying = true;
        const request = (async () => {
            const res = await client().deploy[":project"][":name"].$post({ param: { project, name } });
            const body = await res.json();
            const message = "message" in body ? body.message : res.ok ? "Deployed" : "Deployment failed";
            if (!res.ok) throw new Error(message);
            return message;
        })();
        toast.promise(request, {
            loading: `Deploying ${name}…`,
            success: (message) => `${name}: ${message}`,
            error: (e) => (e instanceof Error ? e.message : "Deployment failed"),
        });
        try {
            await request;
        } catch {
            /* surfaced by the toast */
        } finally {
            isDeploying = false;
        }
    };

    type Lang = "json" | "axios";
    let lang = $state<Lang>("json");
    const shikiLang = $derived<ShikiLang>(lang === "json" ? "json" : "javascript");

    const code = $derived.by(() => {
        const body = JSON.stringify(json(), null, 4);
        if (lang === "json") return body;
        return `import axios from 'axios';

const options = {
    method: 'POST',
    url: 'http://{{host}}/api/v1/gmail/send',
    headers: {
        'X-API-KEY': '<<API-KEY>>',
        'content-type': 'application/json'
    },
    data: {
        subject: '<<SUBJECT>>',
        template: '${name}',
        to: ['someone@example.com'],
        data: ${body.replace(/\n/g, "\n        ")}
    }
};

try {
    const { data } = await axios.request(options);
    console.log(data);
} catch (error) {
    console.error(error);
}`;
    });

    const copyCode = () => navigator.clipboard?.writeText(code).catch(() => {});
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/projects">Projects</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/projects/{project}">{project}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Page>{name}</Breadcrumb.Page>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>

<div class="flex items-start justify-between gap-4">
    <div class="min-w-0">
        <h1 class="text-xl font-semibold">{name}</h1>
        <p class="text-sm text-muted-foreground">Edit, preview and deploy this template.</p>
    </div>
    <div class="flex shrink-0 items-center gap-2">
        <Dialog.Root>
            <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>Preview email</Dialog.Trigger>
            <Dialog.Content class="z-[99999] xl:max-w-5xl">
                <Dialog.Header class="border-b pb-4">
                    <Dialog.Title>Preview</Dialog.Title>
                    <Dialog.Description>Rendering of your template</Dialog.Description>
                </Dialog.Header>
                <Preview {preview} />
            </Dialog.Content>
        </Dialog.Root>
        <Dialog.Root bind:open={testOpen}>
            <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>Send test</Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Send test email</Dialog.Title>
                    <Dialog.Description>
                        Renders the current template with its variable values and sends it via your
                        configured provider.
                    </Dialog.Description>
                </Dialog.Header>
                <div class="py-2">
                    <Input
                        type="email"
                        placeholder="receiver@example.com"
                        bind:value={testEmail}
                        onkeydown={(e) => e.key === "Enter" && sendTest()}
                    />
                </div>
                <Dialog.Footer>
                    <Button variant="outline" onclick={() => (testOpen = false)}>Cancel</Button>
                    <Button onclick={sendTest} disabled={testSending || !testEmail.trim()}>
                        {#if testSending}<LoaderCircle class="size-4 animate-spin" />{:else}<Send
                                class="size-4"
                            />{/if}
                        Send
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
        <Button onclick={deploy} disabled={isDeploying}>
            {#if isDeploying}<LoaderCircle class="size-4 animate-spin" />{/if}
            {isDeploying ? "Deploying" : "Deploy"}
        </Button>
    </div>
</div>

<Tabs.Root value="editor" class="min-h-[700px] w-full max-h-none overflow-x-hidden">
    <Tabs.List>
        <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
        <Tabs.Trigger value="editor">Editor</Tabs.Trigger>
        <Tabs.Trigger value="code">CodeGen</Tabs.Trigger>
        <Tabs.Trigger value="deployment">Deployment</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="variables">
        <div class="overflow-hidden rounded-lg border">
            <table class="w-full table-fixed text-sm">
                <thead class="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                        <th class="w-12 border-r px-3 py-2"></th>
                        <th class="w-1/3 border-r px-3 py-2 font-medium">Name</th>
                        <th class="px-3 py-2 font-medium">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {#each variables as item (item.id)}
                        <tr class="border-b last:border-0">
                            <td class="w-12 border-r p-0 text-center align-middle">
                                <button
                                    type="button"
                                    onclick={() => remove(item.id)}
                                    class="inline-flex size-8 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                                    aria-label="Remove variable"
                                >
                                    <Trash2 class="size-4" />
                                </button>
                            </td>
                            <td class="border-r p-0 align-middle">
                                <input
                                    bind:value={item.name}
                                    onblur={saveVariables}
                                    placeholder="name"
                                    class="block w-full bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground/60 focus:bg-muted/40"
                                />
                            </td>
                            <td class="p-0 align-middle">
                                <input
                                    bind:value={item.value}
                                    onblur={saveVariables}
                                    placeholder="value"
                                    class="block w-full bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground/60 focus:bg-muted/40"
                                />
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <Button variant="ghost" size="sm" class="mt-2 text-blue-500 hover:text-blue-600" onclick={add}>
            <Plus class="size-4" /> Add variable
        </Button>
    </Tabs.Content>

    <Tabs.Content value="editor">
        {#key editorKey}
            <Editor bind:preview doc={data.template.template ?? ""} {project} {name} />
        {/key}
    </Tabs.Content>

    <Tabs.Content value="code">
        <div class="mb-3 flex items-center gap-2">
            <div class="flex rounded-md border p-0.5">
                <button
                    class={buttonVariants({
                        variant: lang === "json" ? "default" : "ghost",
                        size: "sm",
                    })}
                    onclick={() => (lang = "json")}>JSON</button
                >
                <button
                    class={buttonVariants({
                        variant: lang === "axios" ? "default" : "ghost",
                        size: "sm",
                    })}
                    onclick={() => (lang = "axios")}>JS-Axios</button
                >
            </div>
            <Button variant="outline" size="sm" onclick={copyCode}><Copy class="size-4" /> Copy</Button>
        </div>
        {#await highlight(code, shikiLang)}
            <pre class="overflow-auto rounded-md border bg-muted/40 p-4 text-xs"><code>{code}</code></pre>
        {:then html}
            <div class="codegen text-xs">{@html html}</div>
        {:catch}
            <pre class="overflow-auto rounded-md border bg-muted/40 p-4 text-xs"><code>{code}</code></pre>
        {/await}
    </Tabs.Content>

    <Tabs.Content value="deployment">
        <Deployment {project} template={name} onrestored={onRestored} />
    </Tabs.Content>
</Tabs.Root>

<style>
    .codegen :global(.shiki) {
        margin: 0;
        overflow: auto;
        border-radius: var(--radius);
        border: 1px solid var(--border);
        padding: 1rem;
        line-height: 1.5;
    }
    /* Dual-theme: switch to shiki's dark palette when the .dark class is active */
    :global(.dark) .codegen :global(.shiki),
    :global(.dark) .codegen :global(.shiki span) {
        color: var(--shiki-dark) !important;
        background-color: var(--shiki-dark-bg) !important;
    }
</style>
