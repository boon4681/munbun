<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { client } from "$lib/api";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";
    import ShowBox from "$lib/components/munbun/show-box.svelte";
    import History from "@lucide/svelte/icons/history";
    import Preview from "./preview.svelte";

    type Variable = { id: string; name: string; value: string };

    let {
        project,
        template,
        onrestored,
    }: { project: string; template: string; onrestored?: () => void } = $props();

    type Deploy = {
        id: string;
        message: string | null;
        preview: string | null;
        created_at: string;
        template: string;
        variables: Variable[];
    };

    let list = $state<Deploy[]>([]);
    let restoringId = $state<string | null>(null);

    const load = async () => {
        const res = await client().deploy[":project"][":name"].$get({
            param: { project, name: template },
        });
        const json = await res.json();
        list = ("data" in json ? json.data : []) ?? [];
    };

    const useAsCurrent = async (item: Deploy) => {
        if (restoringId) return;
        if (!confirm(`Restore the template and variables from deployment ${item.id}?`)) return;
        restoringId = item.id;
        const request = (async () => {
            const res = await client().template[":project"][":name"].save.$post({
                param: { project, name: template },
                json: { mjml: item.template, variables: item.variables },
            });
            if (!res.ok) throw new Error("Failed to restore deployment");
        })();
        toast.promise(request, {
            loading: `Restoring ${item.id}…`,
            success: "Template restored to this deployment",
            error: (e) => (e instanceof Error ? e.message : "Failed to restore deployment"),
        });
        try {
            await request;
            onrestored?.();
        } catch {
            /* surfaced by the toast */
        } finally {
            restoringId = null;
        }
    };

    onMount(() => {
        load();
        const i = setInterval(load, 4000);
        return () => clearInterval(i);
    });
</script>

<div class="flex flex-col gap-4">
    {#each list as item (item.id)}
        <div class="relative flex justify-between rounded-lg border px-6 py-4">
            <div>
                <div class="flex items-center gap-2 text-sm font-semibold">
                    <div>{item.message?.toUpperCase()}</div>
                    {#if item.message?.toUpperCase() === "SUCCESS"}
                        <div class="size-2.5 rounded-full bg-emerald-600"></div>
                    {:else}
                        <div class="size-2.5 rounded-full bg-red-600"></div>
                    {/if}
                </div>
                <div class="flex gap-4">
                    <div class="flex items-center gap-1 text-muted-foreground">
                        <div class="select-none text-xs font-semibold">project:</div>
                        <div>{project}</div>
                    </div>
                    <div class="flex items-center gap-1 text-muted-foreground">
                        <div class="select-none text-xs font-semibold">template:</div>
                        <div>{template}</div>
                    </div>
                    <div class="flex items-center gap-1 text-muted-foreground">
                        <div class="select-none text-xs font-semibold">at:</div>
                        <div>{item.created_at}</div>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <ShowBox closeOnCopy={false} show={true} class="font-mono">{item.id}</ShowBox>
                <Button
                    variant="outline"
                    size="sm"
                    class="h-8"
                    disabled={restoringId !== null}
                    onclick={() => useAsCurrent(item)}
                >
                    <History class="size-4" /> Restore
                </Button>
                <Dialog.Root>
                    <Dialog.Trigger class={cn(buttonVariants({ variant: "default", size: "sm" }), "h-8 px-3")}>
                        View
                    </Dialog.Trigger>
                    <Dialog.Content class="z-99999 xl:max-w-5xl">
                        <Dialog.Header class="border-b pb-4">
                            <Dialog.Title>Preview</Dialog.Title>
                            <Dialog.Description>Rendering of your deployment</Dialog.Description>
                        </Dialog.Header>
                        {#if item.preview}
                            <Preview preview={item.preview} />
                        {:else}
                            <div>no preview</div>
                        {/if}
                    </Dialog.Content>
                </Dialog.Root>
            </div>
        </div>
    {/each}
    {#if list.length === 0}
        <div class="mt-10 flex justify-center text-muted-foreground">No deployments yet</div>
    {/if}
</div>
