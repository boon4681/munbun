<script lang="ts">
    import { client, type Log } from "@/api";
    import { onMount } from "svelte";
    import { Badge } from "$lib/components/ui/badge/index.js";
    let logs: Log[] = [];
    onMount(async () => {
        logs = await client.GetLogs();
    });

    const mapper = (status: string) => {
        const colors: Record<string, any> = {
            "2": "success",
            "3": "success",
            "4": "warning",
            "5": "destructive",
        };
        return colors[status[0]] ?? "default";
    };
</script>

<div class="flex border-b min-h-24 mb-6">
    <div class="w-full">
        <div class="text-4xl">Logs</div>
        <div class="text-muted-foreground">Filter Coming soon...</div>
        <!-- <div class="text-muted-foreground">View your projects</div> -->
    </div>
</div>

{#each logs as log, _ (log.id)}
    {@const message = JSON.parse(log.message)}
    <div class="flex gap-4 py-2 px-4 border-b">
        <div class="select-none shrink-0">
            <Badge variant={mapper(log.status)}>{log.status}</Badge>
            <Badge variant={log.tag == "http" ? "outline" : "destructive"}>{log.tag}</Badge>
        </div>
        <div class="flex gap-1 w-full">
            <div class="w-12 max-w-12 overflow-hidden overflow-ellipsis">
                {log.id}
            </div>
            <div class="w-20">
                {message.request.method}
            </div>
            <div class="w-full max-w-48 overflow-hidden overflow-ellipsis">
                {message.request.path}
            </div>
            <div class="w-full flex gap-2 max-w-54 overflow-hidden overflow-ellipsis">
                {#if message["user"]}
                    <img class="size-8 rounded-full" src={message.user.picture} alt="" />
                    <div class="w-full overflow-hidden overflow-ellipsis">{message["user"]["email"]}</div>
                {/if}
            </div>
            <div class="w-full flex justify-end">
                {new Date(log.created_at).toLocaleString()}
            </div>
            <div class="w-20 flex justify-end">
                {message.response.time}
            </div>
        </div>
    </div>
{/each}
