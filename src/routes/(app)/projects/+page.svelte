<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/api";
    import { formatDate } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
    import Plus from "@lucide/svelte/icons/plus";
    import Trash2 from "@lucide/svelte/icons/trash-2";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    type Project = { id: string; name: string; description: string | null; created_at: string };

    let projects = $state<Project[]>([]);
    let loading = $state(true);
    let error = $state("");

    let createOpen = $state(false);
    let name = $state("");
    let description = $state("");
    let saving = $state(false);

    const api = () => client();

    const load = async () => {
        loading = true;
        error = "";
        try {
            const res = await api().project.all.$get();
            const json = await res.json();
            projects = "data" in json ? json.data : [];
        } catch (e) {
            error = "Failed to load projects";
        } finally {
            loading = false;
        }
    };

    const create = async () => {
        if (!name.trim()) return;
        saving = true;
        try {
            const res = await api().project.create.$post({
                json: { name: name.trim(), description: description.trim() || undefined },
            });
            if (res.ok) {
                createOpen = false;
                name = "";
                description = "";
                await load();
            } else {
                const json = await res.json();
                error = "message" in json ? json.message : "Failed to create project";
            }
        } finally {
            saving = false;
        }
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this project and all its templates?")) return;
        await api().project[":id"].$delete({ param: { id } });
        await load();
    };

    onMount(load);
</script>

<div class="flex items-center justify-between">
    <div>
        <h1 class="text-xl font-semibold">Projects</h1>
        <p class="text-sm text-muted-foreground">Group your email templates by project.</p>
    </div>
    <Dialog.Root bind:open={createOpen}>
        <Dialog.Trigger>
            {#snippet child({ props })}
                <Button {...props}><Plus class="size-4" /> New project</Button>
            {/snippet}
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Create project</Dialog.Title>
                <Dialog.Description>Give your project a name to get started.</Dialog.Description>
            </Dialog.Header>
            <div class="flex flex-col gap-3 py-2">
                <Input placeholder="Project name" bind:value={name} maxlength={32} />
                <Input placeholder="Description (optional)" bind:value={description} />
            </div>
            <Dialog.Footer>
                <Button variant="outline" onclick={() => (createOpen = false)}>Cancel</Button>
                <Button onclick={create} disabled={saving || !name.trim()}>
                    {#if saving}<LoaderCircle class="size-4 animate-spin" />{/if}
                    Create
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
</div>

{#if error}
    <div class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
    </div>
{/if}

{#if loading}
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle class="size-4 animate-spin" /> Loading…
    </div>
{:else if projects.length === 0}
    <div class="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No projects yet. Create your first one.
    </div>
{:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each projects as project (project.id)}
            <Card.Root>
                <Card.Header>
                    <Card.Title>
                        <a class="hover:underline" href="/projects/{project.id}">{project.name}</a>
                    </Card.Title>
                    <Card.Description>{project.description || "No description"}</Card.Description>
                </Card.Header>
                <Card.Footer class="justify-between text-xs text-muted-foreground">
                    <span>{formatDate(project.created_at)}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="text-muted-foreground hover:text-destructive"
                        onclick={() => remove(project.id)}
                    >
                        <Trash2 class="size-4" />
                    </Button>
                </Card.Footer>
            </Card.Root>
        {/each}
    </div>
{/if}
