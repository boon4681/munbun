<script lang="ts">
    import { page } from "$app/stores";
    import * as Dialog from "@/components/ui/dialog";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { client, type Template } from "@/api.js";
    import TemplateCard from "@/components/munbun/templates/template-card.svelte";
    import { onMount } from "svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Button, buttonVariants } from "@/components/ui/button/index.js";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import MonitorPlay from "lucide-svelte/icons/monitor-play";
    import Trash2 from "lucide-svelte/icons/trash-2";
    import Plus from "lucide-svelte/icons/plus";
    import Editor from "@/components/munbun/editor/editor.svelte";
    import * as SimpleTable from "@/components/munbun/simple-table";
    import * as Tabs from "$lib/components/ui/tabs";
    import { init } from "@paralleldrive/cuid2";
    import { codeToHtml } from "shiki";
    import { mode } from "mode-watcher";
    import Preview from "./(components)/preview.svelte";
    import Deployment from "./(components)/deployment.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();
    let isDeploying = $state(false);
    let variables = $state(data.template.variables);
    const createShortId = init({
        length: 8,
    });
    const add = () => {
        variables.push({
            id: createShortId(),
            name: "",
            value: "",
        });
        variables = variables;
        save();
    };
    const remove = (id: string) => {
        variables = variables.filter((a) => a.id != id);
        save();
    };
    const save = async () => {
        const json = await client.SaveTemplate({
            param: {
                project: data.template.project,
                name: data.template.name,
            },
            json: {
                variables,
            },
        });
    };
    const json = () => {
        const kv: Record<string, string> = {};
        for (const u of variables) {
            kv[u.name] = u.value ?? "";
        }
        return kv;
    };
    const deploy = async () => {
        if (isDeploying) return;
        isDeploying = true;
        let start = Date.now();
        await client.CreateDeployment({
            param: {
                project: data.template.project,
                name: data.template.name,
            },
        });
        setTimeout(
            () => {
                isDeploying = false;
                toast("Deployed " + [data.template.project, data.template.name].join("-"));
            },
            Math.max(1000, Date.now() - start),
        );
    };
    let preview: string = "";
    const languages = [
        {
            label: "JSON",
            value: "json",
            mapper: async () => {
                const code = JSON.stringify(json(), null, 4);
                const html = await codeToHtml(code, {
                    lang: "js",
                    theme: $mode == "dark" ? "min-dark" : "github-light",
                });
                return html;
            },
        },
        {
            label: "JS-Axios",
            value: "js-axios",
            mapper: async () => {
                const kv: Record<string, string> = {};
                for (const u of variables) {
                    kv[u.name] = u.value ?? "";
                }
                const code = `import axios from 'axios';

const options = {
    method: 'POST',
    url: 'http://{{host}}/api/v1/gmail/send',
    headers: {
        'X-API-KEY': '<<API-KEY>>',
        'content-type': 'application/json'
    },
    data: ${JSON.stringify(json(), null, 4).replaceAll(/\r\n|\n/g, "\n   ")}
};

try {
    const { data } = await axios.request(options);
    console.log(data);
} catch (error) {
    console.error(error);
}`;
                const html = await codeToHtml(code, {
                    lang: "js",
                    theme: $mode == "dark" ? "min-dark" : "min-light",
                });
                return html;
            },
        },
    ];
    let selectedLanguage = $state(languages[0]);
    $effect(() => {
        if (variables) {
            save();
        }
    });
</script>

<Breadcrumb.Root>
    <Breadcrumb.List class="text-base">
        <Breadcrumb.Item>
            <Breadcrumb.Link class="text-primary" href="/">Projects</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/projects/{$page.params['id']}">{$page.params["id"]}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/projects/{$page.params['id']}/{$page.params['template']}">
                {$page.params["template"]}
            </Breadcrumb.Link>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>

<div class="flex border-b min-h-24 flex-col mt-4 lg:mt-0 lg:flex-row gap-4 mb-6 pb-4">
    <div class="w-full">
        <h1 class="text-3xl font-semibold">{data.template.name}</h1>
        <div class="text-muted-foreground">template-{data.template.name}</div>
    </div>
    <Dialog.Root>
        <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
            <!-- <MonitorPlay strokeWidth={1} class="mr-2 size-4"></MonitorPlay> -->
            Preview Email
        </Dialog.Trigger>
        <Dialog.Content class="xl:max-w-5xl z-[99999]">
            <Dialog.Header class="border-b pb-4">
                <Dialog.Title>Preview</Dialog.Title>
                <Dialog.Description>Rendering of your template</Dialog.Description>
            </Dialog.Header>
            <Preview {preview}></Preview>
        </Dialog.Content>
    </Dialog.Root>
    <Button variant="outline" on:click={deploy}>
        {#if isDeploying}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Deploy
    </Button>
</div>

<Tabs.Root value="deployment" class="w-full overflow-x-hidden max-h-none min-h-[700px]">
    <Tabs.List>
        <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
        <Tabs.Trigger value="editor">Editor</Tabs.Trigger>
        <Tabs.Trigger value="code">CodeGen</Tabs.Trigger>
        <Tabs.Trigger value="deployment">Deployment</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="editor">
        <Editor
            bind:preview
            doc={data.template.template ?? ""}
            project={data.template.project}
            name={data.template.name}
        ></Editor>
    </Tabs.Content>
    <Tabs.Content value="variables">
        <SimpleTable.Root>
            <SimpleTable.Header>
                <SimpleTable.Row>
                    <SimpleTable.Col class="w-32"></SimpleTable.Col>
                    <SimpleTable.Col>Name</SimpleTable.Col>
                    <SimpleTable.Col>Value</SimpleTable.Col>
                </SimpleTable.Row>
            </SimpleTable.Header>
            <SimpleTable.Body>
                {#each variables as item, _}
                    <SimpleTable.Row>
                        <SimpleTable.Col class="w-32 justify-center">
                            <Button class="size-8 p-2" variant="ghost" on:click={() => remove(item.id)}>
                                <Trash2></Trash2>
                            </Button>
                        </SimpleTable.Col>
                        <SimpleTable.Col edit={true} bind:value={item.name}></SimpleTable.Col>
                        <SimpleTable.Col edit={true} bind:value={item.value}></SimpleTable.Col>
                    </SimpleTable.Row>
                {/each}
            </SimpleTable.Body>
        </SimpleTable.Root>
        <button on:click={add} class="hover:underline text-blue-500 text-sm px-4">+ Add</button>
    </Tabs.Content>
    <Tabs.Content value="code">
        <Select.Root bind:selected={selectedLanguage}>
            <Select.Trigger class="w-[180px]">
                <Select.Value placeholder="Select a Language" />
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    <Select.Label>Language</Select.Label>
                    {#each languages as lang}
                        <Select.Item value={lang.value} label={lang.label}>{lang.label}</Select.Item>
                    {/each}
                </Select.Group>
            </Select.Content>
            <Select.Input name="language" />
        </Select.Root>
        <div class="mt-6"></div>
        {#await languages.find((a) => a.value == selectedLanguage.value)?.mapper() then a}
            {@html a}
        {/await}
    </Tabs.Content>
    <Tabs.Content value="deployment">
        <Deployment project={data.template.project} template={data.template.name}></Deployment>
    </Tabs.Content>
</Tabs.Root>

<style>
    :global(.shiki) {
        padding: 12px;
        @apply rounded-md border;
    }
</style>
