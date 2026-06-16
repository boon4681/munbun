<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/api";
    import { formatDate } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Badge } from "$lib/components/ui/badge";
    import * as Dialog from "$lib/components/ui/dialog";
    import Plus from "@lucide/svelte/icons/plus";
    import Trash2 from "@lucide/svelte/icons/trash-2";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    type User = {
        id: string;
        email: string;
        role: string;
        last_login: string | null;
        created_at: string;
    };

    let users = $state<User[]>([]);
    let me = $state("");
    let loading = $state(true);
    let error = $state("");

    let addOpen = $state(false);
    let email = $state("");
    let saving = $state(false);

    const load = async () => {
        loading = true;
        error = "";
        try {
            const [allRes, meRes] = await Promise.all([
                client().user.all.$get(),
                client().user["@me"].$get(),
            ]);
            const allJson = await allRes.json();
            const meJson = await meRes.json();
            users = "data" in allJson ? allJson.data : [];
            me = "data" in meJson ? meJson.data.email : "";
        } catch {
            error = "Failed to load users";
        } finally {
            loading = false;
        }
    };

    const add = async () => {
        if (!email.trim()) return;
        saving = true;
        error = "";
        try {
            const res = await client().user.$post({ json: { email: email.trim() } });
            if (res.ok) {
                addOpen = false;
                email = "";
                await load();
            } else {
                const json = await res.json();
                error = "message" in json ? json.message : "Failed to add user";
            }
        } finally {
            saving = false;
        }
    };

    const remove = async (target: string) => {
        if (!confirm(`Remove ${target}?`)) return;
        const res = await client().user.$delete({ json: { email: target } });
        if (!res.ok) {
            const json = await res.json();
            error = "message" in json ? json.message : "Failed to remove user";
            return;
        }
        await load();
    };

    onMount(load);
</script>

<div class="flex items-center justify-between">
    <div>
        <h1 class="text-xl font-semibold">Users</h1>
        <p class="text-sm text-muted-foreground">People who can sign in to this dashboard.</p>
    </div>
    <Dialog.Root bind:open={addOpen}>
        <Dialog.Trigger>
            {#snippet child({ props })}
                <Button {...props}><Plus class="size-4" /> Add user</Button>
            {/snippet}
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Add user</Dialog.Title>
                <Dialog.Description>They can sign in with this Google email.</Dialog.Description>
            </Dialog.Header>
            <div class="py-2">
                <Input placeholder="name@example.com" type="email" bind:value={email} />
            </div>
            <Dialog.Footer>
                <Button variant="outline" onclick={() => (addOpen = false)}>Cancel</Button>
                <Button onclick={add} disabled={saving || !email.trim()}>
                    {#if saving}<LoaderCircle class="size-4 animate-spin" />{/if}
                    Add
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
{:else}
    <div class="overflow-x-auto rounded-lg border">
        <table class="w-full text-sm">
            <thead class="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                    <th class="px-3 py-2 font-medium">Email</th>
                    <th class="px-3 py-2 font-medium">Role</th>
                    <th class="px-3 py-2 font-medium">Last login</th>
                    <th class="px-3 py-2"></th>
                </tr>
            </thead>
            <tbody>
                {#each users as user (user.id)}
                    <tr class="border-b last:border-0 hover:bg-muted/30">
                        <td class="px-3 py-2">
                            {user.email}
                            {#if user.email === me}<span class="ml-1 text-xs text-muted-foreground">(you)</span>{/if}
                        </td>
                        <td class="px-3 py-2"><Badge variant="secondary">{user.role}</Badge></td>
                        <td class="px-3 py-2 text-xs text-muted-foreground">{user.last_login ? formatDate(user.last_login) : ""}</td>
                        <td class="px-3 py-2 text-right">
                            {#if user.email !== me}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="text-muted-foreground hover:text-destructive"
                                    onclick={() => remove(user.email)}
                                >
                                    <Trash2 class="size-4" />
                                </Button>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}
