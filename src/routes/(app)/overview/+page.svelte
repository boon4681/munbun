<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/api";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { formatDate, formatRelative } from "$lib/utils";
    import Mail from "@lucide/svelte/icons/mail";
    import TrendingUp from "@lucide/svelte/icons/trending-up";
    import Gauge from "@lucide/svelte/icons/gauge";
    import RefreshCw from "@lucide/svelte/icons/refresh-cw";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    type EmailStats = {
        total: number;
        maxDay: number;
        maxDayDate: string | null;
        maxMonth: number;
        maxMonthDate: string | null;
        todayCount: number;
        dailyLimit: number;
        asOf: string;
    };

    let stats = $state<EmailStats | null>(null);
    let loading = $state(true);
    let error = $state("");

    const fetchStats = async (showLoading: boolean) => {
        if (showLoading) {
            loading = true;
            error = "";
        }
        try {
            const res = await client().logs["email-stats"].$get();
            const json = await res.json();
            if ("data" in json) {
                stats = json.data as EmailStats;
            } else {
                throw new Error("Unexpected response");
            }
        } catch {
            if (showLoading) error = "Failed to load usage stats";
        } finally {
            if (showLoading) loading = false;
        }
    };

    const formatDay = (value: string | null) => {
        if (!value) return "—";
        return formatDate(`${value} 00:00:00`, "MMM dd, yyyy");
    };

    const formatMonth = (value: string | null) => {
        if (!value) return "—";
        return formatDate(`${value}-01 00:00:00`, "MMM yyyy");
    };

    const limitPercent = $derived.by(() => {
        if (!stats || stats.dailyLimit <= 0) return 0;
        return Math.min(100, Math.round((stats.todayCount / stats.dailyLimit) * 100));
    });

    const limitTone = $derived.by(() => {
        if (!stats || stats.dailyLimit <= 0) return "muted";
        const ratio = stats.todayCount / stats.dailyLimit;
        if (ratio >= 1) return "destructive";
        if (ratio >= 0.8) return "warning";
        return "ok";
    });

    onMount(() => {
        void fetchStats(true);
        const interval = setInterval(() => {
            void fetchStats(false);
        }, 10000);
        return () => clearInterval(interval);
    });
</script>

<div class="flex items-center justify-between">
    <div>
        <h1 class="text-xl font-semibold">Overview</h1>
        <p class="text-sm text-muted-foreground">Email delivery usage across all projects.</p>
    </div>
    <Button variant="outline" size="sm" onclick={() => fetchStats(true)} disabled={loading}>
        <RefreshCw class="size-4 {loading ? 'animate-spin' : ''}" /> Refresh
    </Button>
</div>

{#if error}
    <div class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
    </div>
{/if}

{#if loading && !stats}
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle class="size-4 animate-spin" /> Loading…
    </div>
{:else}
    <div class="grid gap-4 sm:grid-cols-2">
        <Card.Root>
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title class="text-sm font-medium text-muted-foreground">Emails sent</Card.Title>
                <Mail class="size-4 text-muted-foreground" />
            </Card.Header>
            <Card.Content>
                <div class="text-3xl font-semibold tracking-tight">{(stats?.total ?? 0).toLocaleString()}</div>
                <p class="mt-1 text-xs text-muted-foreground">
                    Total recipients across all providers.
                </p>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title class="text-sm font-medium text-muted-foreground">Maximum</Card.Title>
                <TrendingUp class="size-4 text-muted-foreground" />
            </Card.Header>
            <Card.Content>
                <div class="text-3xl font-semibold tracking-tight">{(stats?.maxDay ?? 0).toLocaleString()}</div>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Peak single day</span>
                    {#if stats?.maxDayDate}
                        <Badge variant="secondary">{formatDay(stats.maxDayDate)}</Badge>
                    {/if}
                </div>
                {#if stats && stats.maxMonth > 0}
                    <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Peak month</span>
                        <Badge variant="outline">{formatMonth(stats.maxMonthDate)}</Badge>
                        <span class="font-mono">{stats.maxMonth.toLocaleString()}</span>
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>
    </div>

    <Card.Root>
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <Card.Title class="text-sm font-medium text-muted-foreground">Daily limit</Card.Title>
            <Gauge class="size-4 text-muted-foreground" />
        </Card.Header>
        <Card.Content class="flex flex-col gap-2">
            {#if stats && stats.dailyLimit > 0}
                <div class="flex items-baseline justify-between gap-2">
                    <div class="flex items-baseline gap-1">
                        <span class="text-3xl font-semibold tracking-tight">
                            {stats.todayCount.toLocaleString()}
                        </span>
                        <span class="text-sm text-muted-foreground">
                            / {stats.dailyLimit.toLocaleString()}
                        </span>
                    </div>
                    {#if limitTone === "destructive"}
                        <Badge variant="destructive">Limit reached</Badge>
                    {:else if limitTone === "warning"}
                        <Badge variant="secondary">Near limit</Badge>
                    {:else}
                        <span class="text-xs text-muted-foreground">{limitPercent}%</span>
                    {/if}
                </div>
                <div
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax={stats.dailyLimit}
                    aria-valuenow={stats.todayCount}
                    class="relative h-2 w-full overflow-hidden rounded-full bg-muted"
                >
                    <div
                        class="h-full transition-all"
                        class:bg-primary={limitTone === "ok"}
                        class:bg-amber-500={limitTone === "warning"}
                        class:bg-destructive={limitTone === "destructive"}
                        style:width="{limitPercent}%"
                    ></div>
                </div>
                <p class="text-xs text-muted-foreground">
                    {Math.max(0, stats.dailyLimit - stats.todayCount).toLocaleString()} emails remaining today (UTC).
                </p>
            {:else}
                <p class="text-sm text-muted-foreground">
                    No daily limit configured. Set one in
                    <a class="font-medium underline" href="/settings">Settings → Daily send limit</a>.
                </p>
            {/if}
        </Card.Content>
    </Card.Root>

    {#if stats?.asOf}
        <p class="text-xs text-muted-foreground">
            Last updated {formatRelative(stats.asOf)}.
        </p>
    {/if}
{/if}
