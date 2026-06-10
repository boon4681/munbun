<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/api";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Card from "$lib/components/ui/card";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Check from "@lucide/svelte/icons/check";

    let resendApiKey = $state("");
    let gmailUser = $state("");
    let gmailPass = $state("");

    let loading = $state(true);
    let saving = $state(false);
    let saved = $state(false);
    let error = $state("");

    const load = async () => {
        loading = true;
        try {
            const res = await client().settings.email.$get();
            const json = await res.json();
            if ("data" in json) {
                resendApiKey = json.data.resend_api_key ?? "";
                gmailUser = json.data.gmail_smtp_user ?? "";
                gmailPass = json.data.gmail_smtp_pass ?? "";
            }
        } catch {
            error = "Failed to load settings";
        } finally {
            loading = false;
        }
    };

    const save = async () => {
        saving = true;
        saved = false;
        error = "";
        try {
            const res = await client().settings.email.$post({
                json: {
                    resend_api_key: resendApiKey,
                    gmail_smtp_user: gmailUser,
                    gmail_smtp_pass: gmailPass,
                },
            });
            if (res.ok) {
                saved = true;
                setTimeout(() => (saved = false), 2000);
            } else {
                error = "Failed to save settings";
            }
        } finally {
            saving = false;
        }
    };

    onMount(load);
</script>

<div>
    <h1 class="text-xl font-semibold">Email service</h1>
    <p class="text-sm text-muted-foreground">
        Configure at least one provider so templates can be delivered.
    </p>
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
    <div class="grid gap-4 lg:grid-cols-2">
        <Card.Root>
            <Card.Header>
                <Card.Title>Resend</Card.Title>
                <Card.Description>Send through the Resend API.</Card.Description>
            </Card.Header>
            <Card.Content class="flex flex-col gap-2">
                <label class="text-sm font-medium" for="resend">API key</label>
                <Input id="resend" type="password" placeholder="re_..." bind:value={resendApiKey} />
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Gmail SMTP</Card.Title>
                <Card.Description>Send through a Gmail account using an app password.</Card.Description>
            </Card.Header>
            <Card.Content class="flex flex-col gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium" for="gmail-user">User</label>
                    <Input id="gmail-user" placeholder="you@gmail.com" bind:value={gmailUser} />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium" for="gmail-pass">App password</label>
                    <Input id="gmail-pass" type="password" placeholder="••••••••" bind:value={gmailPass} />
                </div>
            </Card.Content>
        </Card.Root>
    </div>

    <div class="flex items-center gap-3">
        <Button onclick={save} disabled={saving}>
            {#if saving}<LoaderCircle class="size-4 animate-spin" />{:else if saved}<Check class="size-4" />{/if}
            {saved ? "Saved" : "Save changes"}
        </Button>
    </div>
{/if}
