<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Mail from "@lucide/svelte/icons/mail";

    let { onerror }: { onerror?: (message: string) => void } = $props();
    let isLoading = $state(false);

    const openGoogle = () => {
        isLoading = true;
        const popup = window.open(
            "/api/auth/google",
            "login",
            "width=480,height=560,toolbar=0,menubar=0,location=0,resizable=no,copyhistory=no",
        );
        if (!popup) {
            isLoading = false;
            onerror?.("Popup was blocked");
            return;
        }
        const timer = setInterval(async () => {
            if (!popup.closed) return;
            clearInterval(timer);
            const ok = await fetch("/api/user/@me")
                .then((r) => r.ok)
                .catch(() => false);
            if (ok) {
                window.location.href = "/";
            } else {
                onerror?.("Failed to login");
            }
            isLoading = false;
        }, 100);
    };
</script>

<Button variant="outline" type="button" onclick={openGoogle} disabled={isLoading} class="w-full">
    {#if isLoading}
        <LoaderCircle class="mr-2 size-4 animate-spin" />
    {:else}
        <Mail class="mr-2 size-4" />
    {/if}
    Continue with Google
</Button>
