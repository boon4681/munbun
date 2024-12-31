<script lang="ts">
    import { goto } from "$app/navigation";
    import { client, type Project, type Template } from "@/api";
    import { time_format, type StripResponse } from "@/utils";
    import Mail from "lucide-svelte/icons/mail";
    import Ellipsis from "lucide-svelte/icons/ellipsis";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { clickIgnore } from "@/use/clickIgnore.svelte";
    import { Button } from "@/components/ui/button";
    import { page } from "$app/stores";
    import CardPopup from "./(card)/card-popup.svelte";
    export let project: Project;
    export let item: Template;
    let isLoading = false;

    let openDel = false;
    const open_del = () => {
        openDel = true;
    };
    const del = async () => {
        if (isLoading) return;
        let start = Date.now();
        isLoading = true;
        await client.DeleteTemplate({
            param: {
                project: item.project,
                name: item.name
            },
        });
        setTimeout(
            () => {
                close();
                openDel = false;
                isLoading = false;
            },
            Math.max(1500, Date.now() - start),
        );
    };
</script>

<CardPopup {item} bind:open={openDel} {isLoading} on:click={del}></CardPopup>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    use:clickIgnore
    on:clickIgnore={() => goto("/projects/" + project.name + "-" + project.id + "/" + item.name)}
    id={item.project + "-" + item.name}
    role="button"
    class="border border-muted-foregrund flex flex-col h-40 hover:bg-muted/40 transition-all px-6 py-6 rounded-lg"
>
    <div class="flex">
        <div class="flex items-center gap-2">
            <Mail size={20} strokeWidth={1}></Mail>
            <div>
                {item.name}
            </div>
        </div>
        <div class="z-10 ml-auto" data-click-ignore>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button size="icon" builders={[builder]} variant="ghost">
                        <Ellipsis></Ellipsis>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-32">
                    <DropdownMenu.Group>
                        <DropdownMenu.Label>Action</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <!-- <DropdownMenu.Item>Update</DropdownMenu.Item> -->
                        <DropdownMenu.Item class="text-red-500" on:click={open_del}>Delete</DropdownMenu.Item>
                    </DropdownMenu.Group>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>
    
    <div class="mt-auto">
        <p class="text-sm text-muted-foreground/60" data-click-ignore>
            Created about {time_format(new Date(item.created_at + "Z").getTime() - Date.now())}
        </p>
    </div>
</div>
