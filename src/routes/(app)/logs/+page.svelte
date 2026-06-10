<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/api";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import RefreshCw from "@lucide/svelte/icons/refresh-cw";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    type Log = {
        id: string;
        tag: string;
        status: string;
        message: string;
        created_at: string;
    };

    type Parsed = {
        request?: { method?: string; path?: string };
        response?: { status?: number; time?: string };
        user?: { email?: string };
    };

    let logs = $state<Log[]>([]);
    let loading = $state(true);
    let error = $state("");

    const parse = (message: string): Parsed => {
        try {
            return JSON.parse(message) as Parsed;
        } catch {
            return {};
        }
    };

    const load = async () => {
        loading = true;
        error = "";
        try {
            const res = await client().logs.logs.$get();
            const json = await res.json();
            logs = "data" in json ? json.data : [];
        } catch {
            error = "Failed to load logs";
        } finally {
            loading = false;
        }
    };

    const tagVariant = (tag: string) =>
        tag === "error" ? "destructive" : tag === "auth" ? "secondary" : "outline";

    onMount(load);
</script>

<div class="flex items-center justify-between">
    <div>
        <h1 class="text-xl font-semibold">Logs</h1>
        <p class="text-sm text-muted-foreground">Most recent 100 requests.</p>
    </div>
    <Button variant="outline" size="sm" onclick={load} disabled={loading}>
        <RefreshCw class="size-4 {loading ? 'animate-spin' : ''}" /> Refresh
    </Button>
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
{:else if logs.length === 0}
    <div class="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No logs yet.
    </div>
{:else}
    <div class="overflow-x-auto rounded-lg border">
        <table class="w-full text-sm">
            <thead class="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                    <th class="px-3 py-2 font-medium">Tag</th>
                    <th class="px-3 py-2 font-medium">Request</th>
                    <th class="px-3 py-2 font-medium">Status</th>
                    <th class="px-3 py-2 font-medium">User</th>
                    <th class="px-3 py-2 font-medium">Time</th>
                    <th class="px-3 py-2 font-medium">When</th>
                </tr>
            </thead>
            <tbody>
                {#each logs as log (log.id)}
                    {@const m = parse(log.message)}
                    <tr class="border-b last:border-0 hover:bg-muted/30">
                        <td class="px-3 py-2">
                            <Badge variant={tagVariant(log.tag)}>{log.tag}</Badge>
                        </td>
                        <td class="px-3 py-2">
                            <span class="font-mono text-xs">
                                <span class="font-semibold">{m.request?.method}</span>
                                {m.request?.path}
                            </span>
                        </td>
                        <td class="px-3 py-2 font-mono text-xs">{log.status}</td>
                        <td class="px-3 py-2 text-xs text-muted-foreground">{m.user?.email ?? ""}</td>
                        <td class="px-3 py-2 font-mono text-xs">{m.response?.time ?? ""}</td>
                        <td class="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{log.created_at}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}
