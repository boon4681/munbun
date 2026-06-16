<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/api";
    import { formatDate } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import LogsChart from "$lib/components/munbun/logs-chart.svelte";
    import RefreshCw from "@lucide/svelte/icons/refresh-cw";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";

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

    type LogStat = {
        date: string;
        total: number;
        errors: number;
        avgMs: number | null;
    };

    type ChartRange = "1d" | "3d" | "7d" | "14d" | "30d";

    let logs = $state<Log[]>([]);
    let stats = $state<LogStat[]>([]);
    let chartRange: ChartRange = $state("3d");
    let loading = $state(true);
    let error = $state("");

    const parse = (message: string): Parsed => {
        try {
            return JSON.parse(message) as Parsed;
        } catch {
            return {};
        }
    };

    function rangeDays(key: ChartRange) {
        return { "1d": 1, "3d": 3, "7d": 7, "14d": 14, "30d": 30 }[key];
    }

    const fetchData = async (showLoading: boolean) => {
        if (showLoading) {
            loading = true;
            error = "";
        }
        try {
            const [logsRes, statsRes] = await Promise.all([
                client().logs.logs.$get(),
                client().logs.stats.$get({
                    query: {
                        days: String(rangeDays(chartRange)),
                        steps: "72",
                    },
                }),
            ]);

            const logsJson = await logsRes.json();
            const statsJson = await statsRes.json();

            logs = "data" in logsJson ? logsJson.data : [];
            stats = "data" in statsJson ? statsJson.data : [];
        } catch {
            if (showLoading) error = "Failed to load logs";
        } finally {
            if (showLoading) loading = false;
        }
    };

    const tagVariant = (tag: string) =>
        tag === "error" ? "destructive" : tag === "auth" ? "secondary" : "outline";

    $effect(() => {
        void fetchData(true);
    });

    onMount(() => {
        const interval = setInterval(() => {
            void fetchData(false);
        }, 5000);

        return () => clearInterval(interval);
    });
</script>


<ScrollArea class="flex-1 overflow-hidden">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-xl font-semibold">Logs</h1>
            <p class="text-sm text-muted-foreground">Most recent 100 requests.</p>
        </div>
        <Button variant="outline" size="sm" onclick={() => fetchData(true)} disabled={loading}>
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
        <LogsChart {logs} {stats} range={chartRange} onrangechange={(key) => { chartRange = key; }} />
    
        <div class="min-w-0 overflow-x-auto rounded-lg border">
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
                            <td class="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.created_at)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</ScrollArea>
