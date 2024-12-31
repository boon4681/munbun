<script lang="ts">
    import type { Project } from "@/api";
    import { Button } from "@/components/ui/button";
    import * as Dialog from "@/components/ui/dialog";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    export let item: Project;
    export let isLoading = false;
    export let open = false;
    let name = "";
</script>

<Dialog.Root bind:open closeOnOutsideClick={!isLoading} onOutsideClick={close}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Are you absolutely sure?</Dialog.Title>
            <Dialog.Description>
                This action cannot be undone. This will permanently delete the project. If you are sure please enter the
                project name to delete this project.
            </Dialog.Description>
        </Dialog.Header>
        <div></div>
        <div class="grid w-full items-center gap-1.5">
            <Label for="project-name" class="flex items-center gap-1">
                <span>
                    To confirm, type
                    <div class="px-3 text-nowrap py-2 border my-2 border-muted-foreground/60 rounded-md inline-block">{item.name + "-" + item.id}</div>
                    in the box below:
                </span>
            </Label>
            <Input id="project-name" placeholder="Enter project name to confirm" bind:value={name}></Input>
        </div>
        <Dialog.Footer>
            <Button class="w-32" variant="destructive" disabled={name != item.name + "-" + item.id} on:click>
                {#if isLoading}
                    <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
                {/if}
                Delete
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
