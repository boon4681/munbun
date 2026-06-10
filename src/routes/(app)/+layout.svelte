<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar";
    import { Separator } from "$lib/components/ui/separator";
    import AppSidebar from "$lib/components/munbun/app-sidebar.svelte";
    import { page } from "$app/state";

    let { data, children } = $props();

    const title = $derived(
        (() => {
            const seg = page.url.pathname.split("/").filter(Boolean)[0];
            return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "Home";
        })(),
    );
</script>

<Sidebar.Provider>
    <AppSidebar user={data.user} />
    <Sidebar.Inset>
        <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <Sidebar.Trigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 !h-4" />
            <span class="font-medium">{title}</span>
        </header>
        <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {#if !data.ready}
                <div
                    class="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
                >
                    Please set <b>Resend API key</b> or <b>Gmail SMTP</b> in
                    <a class="font-medium underline" href="/settings">Settings → Email service</a>.
                </div>
            {/if}
            {@render children()}
        </div>
    </Sidebar.Inset>
</Sidebar.Provider>
