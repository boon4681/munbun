<script lang="ts">
    import { Button } from "@/components/ui/button";
    import * as Dialog from "@/components/ui/dialog";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Textarea } from "@/components/ui/textarea";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import Plus from "lucide-svelte/icons/plus";
    import { onMount } from "svelte";
    import { client, type Project } from "@/api";
    import ProjectCard from "@/components/munbun/projects/project-card.svelte";

    let open = false;
    let name = "";
    let description = "";
    let list: Project[] = [];

    let isLoading = false;
    const load = async () => {
        list = await client.GetAllProjects();
    };

    const submit = async () => {
        if (isLoading) return;
        let start = Date.now();
        isLoading = true;
        await client.CreateProject({
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
</script>

<div class="flex border-b min-h-24 mb-6">
    <div class="w-full">
        <div class="text-4xl">Projects</div>
        <div class="text-muted-foreground">Manage your projects</div>
    </div>
    <Dialog.Root bind:open closeOnOutsideClick={!isLoading} onOutsideClick={close}>
        <Dialog.Trigger asChild let:builder>
            <Button builders={[builder]}>
                <Plus class="mr-2 h-4 w-4" />
                Create Project
            </Button>
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Add a project</Dialog.Title>
                <Dialog.Description>The home of something big!</Dialog.Description>
            </Dialog.Header>
            <div class="grid w-full items-center gap-1.5">
                <Label for="project-name">Name</Label>
                <Input id="project-name" placeholder="Project name" bind:value={name}></Input>
                <p class="text-muted-foreground text-sm">Enter your project name.</p>
            </div>
            <div class="grid w-full items-center gap-1.5">
                <Label for="project-description">Description</Label>
                <Textarea
                    id="project-description"
                    class="resize-none h-28"
                    placeholder="Description about your project."
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
<div class="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
    {#each list as item, _ (item.id)}
        <ProjectCard {item}></ProjectCard>
    {/each}
</div>
