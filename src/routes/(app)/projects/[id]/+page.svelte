<script lang="ts">
    import { onMount } from "svelte";
    import { invalidateAll } from "$app/navigation";
    import { client } from "$lib/api";
    import { formatDate } from "$lib/utils";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import ShowBox from "$lib/components/munbun/show-box.svelte";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import KeySquare from "@lucide/svelte/icons/key-square";
    import Plus from "@lucide/svelte/icons/plus";
    import Trash2 from "@lucide/svelte/icons/trash-2";

    type Template = {
        name: string;
        project: string;
        description: string | null;
        created_at: string;
    };

    let { data } = $props();
    const project = $derived(data.project);
    let templates = $state<Template[]>([]);

    let open = $state(false);
    let name = $state("");
    let description = $state("");
    let saving = $state(false);
    let error = $state("");

    const load = async () => {
        const res = await client().template[":project"].all.$get({
            param: { project: project.id },
        });
        const json = await res.json();
        templates = ("data" in json ? json.data : []) ?? [];
    };

    const create = async () => {
        if (saving || !name.trim()) return;
        saving = true;
        error = "";
        try {
            const res = await client().template[":project"].create.$post({
                param: { project: project.id },
                json: { name: name.trim(), description: description.trim() || undefined },
            });
            if (res.ok) {
                open = false;
                name = "";
                description = "";
                await load();
            } else {
                const json = await res.json();
                error = "message" in json ? json.message : "Failed to create template";
            }
        } finally {
            saving = false;
        }
    };

    const removeTemplate = async (templateName: string) => {
        if (!confirm(`Delete template "${templateName}"?`)) return;
        await client().template[":project"][":name"].$delete({
            param: { project: project.id, name: templateName },
        });
        await load();
    };

    const revoke = async () => {
        if (!confirm("Revoke and regenerate the API key? Existing integrations will break.")) return;
        const res = await client().project[":id"]["api-key"].$patch({
            param: { id: project.id },
        });
        if (res.ok) {
            await invalidateAll();
        }
    };

    onMount(() => {
        load();
        const i = setInterval(load, 4000);
        return () => clearInterval(i);
    });
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/projects">Projects</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Page>{project.name}</Breadcrumb.Page>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>

<div class="flex items-start justify-between gap-4">
    <div class="min-w-0">
        <h1 class="text-xl font-semibold">{project.name}</h1>
        <p class="text-sm text-muted-foreground">Templates in this project.</p>
        <ShowBox placeholder="API-KEY" class="mt-1 font-mono">{project.api_key}</ShowBox>
    </div>
    <div class="flex shrink-0 items-center gap-2">
        <Button variant="outline" onclick={revoke}>
            <KeySquare class="size-4" /> Revoke key
        </Button>
        <Dialog.Root bind:open>
            <Dialog.Trigger>
                {#snippet child({ props })}
                    <Button {...props}><Plus class="size-4" /> New template</Button>
                {/snippet}
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Create template</Dialog.Title>
                    <Dialog.Description>Create a new email template in this project.</Dialog.Description>
                </Dialog.Header>
                <div class="flex flex-col gap-3 py-2">
                    <Input placeholder="Template name" bind:value={name} maxlength={32} />
                    <Textarea
                        class="h-24 resize-none"
                        placeholder="Description (optional)"
                        bind:value={description}
                    />
                </div>
                <Dialog.Footer>
                    <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
                    <Button onclick={create} disabled={saving || !name.trim()}>
                        {#if saving}<LoaderCircle class="size-4 animate-spin" />{/if}
                        Create
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    </div>
</div>

{#if error}
    <div class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
    </div>
{/if}

{#if templates.length === 0}
    <div class="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No templates yet. Create your first one.
    </div>
{:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each templates as item (item.name)}
            <Card.Root>
                <Card.Header>
                    <Card.Title>
                        <a class="hover:underline" href="/projects/{project.id}/{item.name}">{item.name}</a>
                    </Card.Title>
                    <Card.Description>{item.description || "No description"}</Card.Description>
                </Card.Header>
                <Card.Footer class="justify-between text-xs text-muted-foreground">
                    <span>{formatDate(item.created_at)}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="text-muted-foreground hover:text-destructive"
                        onclick={() => removeTemplate(item.name)}
                    >
                        <Trash2 class="size-4" />
                    </Button>
                </Card.Footer>
            </Card.Root>
        {/each}
    </div>
{/if}
