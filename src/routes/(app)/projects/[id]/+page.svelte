<script lang="ts">
    import { page } from "$app/stores";
    import * as Dialog from "@/components/ui/dialog";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { client, type Template } from "@/api.js";
    import TemplateCard from "@/components/munbun/templates/template-card.svelte";
    import { onMount } from "svelte";
    import { Button } from "@/components/ui/button/index.js";
    import { Label } from "@/components/ui/label/index.js";
    import { Input } from "@/components/ui/input/index.js";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import KeySquare from "lucide-svelte/icons/key-square";
    import Plus from "lucide-svelte/icons/plus";
    import { Textarea } from "@/components/ui/textarea/index.js";
    import ShowBox from "@/components/munbun/show-box.svelte";

    export let data;
    let templates: Template[] = [];
    const load = async () => {
        templates = await client.GetAllTemplates({
            param: {
                project: data.project.id,
            },
        });
    };

    let open = false;
    let name = "";
    let description = "";

    let isLoading = false;

    const revoke = async () => {
        if (isLoading) return;
        let start = Date.now();
        isLoading = true;
        
        setTimeout(
            () => {
                close();
                isLoading = false;
            },
            Math.max(1000, Date.now() - start),
        );
    }

    const submit = async () => {
        if (isLoading) return;
        let start = Date.now();
        isLoading = true;
        await client.CreateTemplate({
            param: {
                project: data.project.id,
            },
            json: {
                name,
                description,
            },
        });
        open = false;
        setTimeout(
            () => {
                close();
                isLoading = false;
            },
            Math.max(1000, Date.now() - start),
        );
    };

    const close = () => {
        open = false;
        name = "";
        description = "";
    };

    onMount(() => {
        load();
        const i = setInterval(load, 2000);
        return () => {
            clearInterval(i);
        };
    });

    onMount(() => {
        load();
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
    </Breadcrumb.List>
</Breadcrumb.Root>

<div class="flex border-b min-h-24 flex-col mt-4 lg:mt-0 lg:flex-row gap-4 mb-6">
    <div class="w-full">
        <h1 class="text-3xl font-semibold">{data.project.name}</h1>
        <div class="text-muted-foreground">{data.project.name}-{data.project.id}</div>
        <div class="flex items-center gap-4">
            <ShowBox placeholder={"API-KEY"}>{data.project.api_key}</ShowBox>
        </div>
    </div>
    <div class="flex flex-col md:flex-row gap-2">
        <Button variant="outline" class="w-full">
            <KeySquare class="mr-2 h-4 w-4" />
            Revoke API-KEY
        </Button>
        <Dialog.Root bind:open closeOnOutsideClick={!isLoading} onOutsideClick={close}>
            <Dialog.Trigger asChild let:builder>
                <Button builders={[builder]} class="w-full">
                    <Plus class="mr-2 h-4 w-4" />
                    Create Template
                </Button>
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Add a template</Dialog.Title>
                    <Dialog.Description>The home of something big!</Dialog.Description>
                </Dialog.Header>
                <div class="grid w-full items-center gap-1.5">
                    <Label for="template-name">Name</Label>
                    <Input id="template-name" placeholder="Project name" bind:value={name}></Input>
                    <p class="text-muted-foreground text-sm">Enter your template name.</p>
                </div>
                <div class="grid w-full items-center gap-1.5">
                    <Label for="template-description">Description</Label>
                    <Textarea
                        id="template-description"
                        class="resize-none h-28"
                        placeholder="Description about your template."
                        bind:value={description}
                    ></Textarea>
                </div>
                <Dialog.Footer>
                    <Button class="w-32" on:click={submit}>
                        {#if isLoading}
                            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
                        {/if}
                        Create
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    </div>
</div>
{#if templates.length}
    <div class="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {#each templates as item, _ (item.name + item.project)}
            <TemplateCard project={data.project} {item}></TemplateCard>
        {/each}
    </div>
{:else}
    <div class="mt-10 justify-center flex text-muted-foreground">No templates found</div>
{/if}
