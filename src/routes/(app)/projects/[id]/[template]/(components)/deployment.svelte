<script lang="ts">
    import * as Dialog from "@/components/ui/dialog";
    import { client, type Deploy } from "@/api";
    import { page } from "$app/stores";
    import ShowBox from "@/components/munbun/show-box.svelte";
    import { onMount } from "svelte";
    import { buttonVariants } from "@/components/ui/button";
    import Preview from "./preview.svelte";
    import { cn } from "@/utils";
    export let project: string;
    export let template: string;
    let list: Deploy[] = [];
    const load = async () => {
        list = await client.GetAllDeployment({
            param: {
                project,
                name: template,
            },
        });
    };
    onMount(() => {
        load();
        const i = setInterval(load, 2000);
        return () => {
            clearInterval(i);
        };
    });
</script>

<div class="flex flex-col gap-4">
    {#each list as item, _ (item.id)}
        <div class="border rounded-lg px-6 py-4 relative flex justify-between">
            <div>
                <div class="font-semibold text-sm flex gap-2 items-center">
                    <div>{item.message?.toUpperCase()}</div>
                    {#if item.message?.toUpperCase() == "SUCCESS"}
                        <div class="size-2.5 bg-emerald-600 rounded-full"></div>
                    {:else}
                        <div class="size-2.5 bg-red-600 rounded-full"></div>
                    {/if}
                </div>
                <div class="flex gap-4">
                    <div class="text-muted-foreground flex items-center gap-1">
                        <div class="text-xs font-semibold select-none">project:</div>
                        <div>{$page.params.id.split("-")[0]}</div>
                    </div>
                    <div class="text-muted-foreground flex items-center gap-1">
                        <div class="text-xs font-semibold select-none">template:</div>
                        <div>{$page.params.template}</div>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <ShowBox closeOnCopy={false} show={true}>{item.id}</ShowBox>

                <Dialog.Root>
                    <Dialog.Trigger class={cn(buttonVariants({ variant: "default", size: "sm" }),"h-8")}>
                        <!-- <MonitorPlay strokeWidth={1} class="mr-2 size-4"></MonitorPlay> -->
                        View
                    </Dialog.Trigger>
                    <Dialog.Content class="xl:max-w-5xl z-[99999]">
                        <Dialog.Header class="border-b pb-4">
                            <Dialog.Title>Preview</Dialog.Title>
                            <Dialog.Description>Rendering of your template</Dialog.Description>
                        </Dialog.Header>
                        {#if item.preview}
                            <Preview preview={item.preview}></Preview>
                            {:else}
                            <div>no preview</div>
                        {/if}
                    </Dialog.Content>
                </Dialog.Root>
            </div>
        </div>
    {/each}
</div>
