<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/api";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Card from "$lib/components/ui/card";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Check from "@lucide/svelte/icons/check";
    import Download from "@lucide/svelte/icons/download";
    import Upload from "@lucide/svelte/icons/upload";

    let resendApiKey = $state("");
    let gmailUser = $state("");
    let gmailPass = $state("");
    let dailyEmailLimit = $state(500);

    let loading = $state(true);
    let saving = $state(false);
    let saved = $state(false);
    let error = $state("");

    let restoring = $state(false);
    let restoreError = $state("");
    let restoreSuccess = $state(false);
    let restoreOpen = $state(false);
    let restoreFile: File | null = $state(null);
    let fileInput: HTMLInputElement;

    const load = async () => {
        loading = true;
        try {
            const res = await client().settings.email.$get();
            const json = await res.json();
            if ("data" in json) {
                resendApiKey = json.data.resend_api_key ?? "";
                gmailUser = json.data.gmail_smtp_user ?? "";
                gmailPass = json.data.gmail_smtp_pass ?? "";
                dailyEmailLimit = json.data.daily_email_limit ?? 500;
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
                    daily_email_limit: dailyEmailLimit,
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

    const downloadBackup = () => {
        window.open("/api/settings/backup", "_blank");
    };

    const handleFile = (e: Event) => {
        const input = e.target as HTMLInputElement;
        restoreFile = input.files?.[0] ?? null;
    };

    const doRestore = async () => {
        if (!restoreFile) return;
        restoring = true;
        restoreError = "";
        restoreSuccess = false;
        try {
            const res = await fetch("/api/settings/restore", {
                method: "POST",
                headers: { "Content-Type": "application/octet-stream" },
                body: await restoreFile.arrayBuffer(),
            });
            const json = await res.json();
            if (res.ok) {
                restoreSuccess = true;
                restoreFile = null;
                if (fileInput) fileInput.value = "";
                setTimeout(() => {
                    restoreOpen = false;
                    restoreSuccess = false;
                }, 2000);
            } else {
                restoreError = json.error ?? "Restore failed";
            }
        } catch {
            restoreError = "Failed to restore database";
        } finally {
            restoring = false;
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

    <Card.Root>
        <Card.Header>
            <Card.Title>Daily send limit</Card.Title>
            <Card.Description>Per-day cap used to show usage on the overview. Gmail SMTP allows ~500/day.</Card.Description>
        </Card.Header>
        <Card.Content class="flex flex-col gap-2">
            <label class="text-sm font-medium" for="daily-limit">Max emails per day</label>
            <Input
                id="daily-limit"
                type="number"
                min="0"
                step="1"
                bind:value={dailyEmailLimit}
                class="max-w-[12rem]"
            />
        </Card.Content>
    </Card.Root>

    <div class="flex items-center gap-3">
        <Button onclick={save} disabled={saving}>
            {#if saving}<LoaderCircle class="size-4 animate-spin" />{:else if saved}<Check class="size-4" />{/if}
            {saved ? "Saved" : "Save changes"}
        </Button>
    </div>

    <div class="mt-8">
        <h2 class="text-lg font-semibold">Database</h2>
        <p class="text-sm text-muted-foreground">Download a backup or restore from a previous backup file.</p>
    </div>

    <div class="flex items-center gap-3">
        <Button variant="outline" onclick={downloadBackup}>
            <Download class="size-4" /> Download backup
        </Button>

        <AlertDialog.Root open={restoreOpen} onOpenChange={(o) => { restoreOpen = o; restoreError = ""; restoreSuccess = false; }}>
            <AlertDialog.Trigger asChild>
                <Button variant="outline">
                    <Upload class="size-4" /> Restore from backup
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>Restore database</AlertDialog.Title>
                    <AlertDialog.Description>
                        This will replace the current database with the uploaded backup file.
                        A backup of the current database will be saved before restoring.
                    </AlertDialog.Description>
                </AlertDialog.Header>

                {#if restoreError}
                    <div class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {restoreError}
                    </div>
                {/if}

                {#if restoreSuccess}
                    <div class="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-600">
                        Database restored successfully.
                    </div>
                {/if}

                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium" for="restore-file">Select backup file (.db)</label>
                    <Input id="restore-file" type="file" accept=".db" onchange={handleFile} bind:this={fileInput} />
                </div>

                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                    <Button onclick={doRestore} disabled={!restoreFile || restoring}>
                        {#if restoring}<LoaderCircle class="size-4 animate-spin" />{/if}
                        Restore
                    </Button>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
    </div>
{/if}
