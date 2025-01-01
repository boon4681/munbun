<script lang="ts">
    import { client, type User } from "@/api";
    import * as SimpleTable from "@/components/munbun/simple-table";
    import Button from "@/components/ui/button/button.svelte";
    import { me } from "@/store";
    import Trash2 from "lucide-svelte/icons/trash-2";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";

    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    let users: User[] = [];
    let isLoading = false;
    const remove = async (email: string) => {
        if (email == $me.email) {
            toast.error("You cannot remove yourself");
            return;
        }
        isLoading = true;
        await client.DeleteUser({
            json: {
                email,
            },
        });
        users = await client.GetAllUsers();
        isLoading = false;
    };
    const add = async () => {
        const email = prompt("Email here")!;
        isLoading = true;
        await client.CreateUser({
            json: {
                email,
            },
        });
        users = await client.GetAllUsers();
        isLoading = false;
    };

    onMount(async () => {
        users = await client.GetAllUsers();
    });
</script>

<div class="flex border-b min-h-24 mb-6">
    <div class="w-full">
        <div class="text-4xl">Users</div>
        <div class="text-muted-foreground">Manage your users</div>
    </div>
</div>

<SimpleTable.Root>
    <SimpleTable.Header>
        <SimpleTable.Row>
            <SimpleTable.Col class="w-32"></SimpleTable.Col>
            <SimpleTable.Col>Email</SimpleTable.Col>
            <SimpleTable.Col>Role</SimpleTable.Col>
        </SimpleTable.Row>
    </SimpleTable.Header>
    <SimpleTable.Body>
        {#each users as item, _}
            <SimpleTable.Row>
                <SimpleTable.Col class="w-32 justify-center">
                    <Button disabled={isLoading} class="size-8 p-2" variant="ghost" on:click={() => remove(item.email)}>
                        {#if isLoading}
                            <LoaderCircle class="animate-spin"></LoaderCircle>
                        {:else}
                            <Trash2></Trash2>
                        {/if}
                    </Button>
                </SimpleTable.Col>
                <SimpleTable.Col>{item.email}</SimpleTable.Col>
                <SimpleTable.Col>{item.role}</SimpleTable.Col>
            </SimpleTable.Row>
        {/each}
    </SimpleTable.Body>
</SimpleTable.Root>
<button on:click={add} class="hover:underline text-blue-500 text-sm px-4">+ Add</button>
