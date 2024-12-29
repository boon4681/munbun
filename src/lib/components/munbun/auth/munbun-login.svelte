<script lang="ts">
    import { cn } from "$lib/utils.js";
    import { Button } from "@/components/ui/button";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import Mail from "lucide-svelte/icons/mail";
    import { toast } from "svelte-sonner";
    let className: string | undefined | null = undefined;
    export { className as class };
    const open_google = async () => {
        isLoading = true;

        const open = window.open(
            "/api/auth/google",
            "login",
            "width=480,height=560,toolbar=0,menubar=0,location=0,resizable=no,copyhistory=no",
        );
        if (open) {
            let c = setInterval(async () => {
                if (open.closed) {
                    clearInterval(c);
                    const x = await fetch("/api/user/@me")
                        .then((a) => a.json())
                        .catch((a) => false);
                    if (x) {
                        window.location.reload();
                    } else {
                        toast.error("Failed to login");
                    }
                    isLoading = false;
                }
            }, 100);
        }
    };
    let isLoading = false;
</script>

<div class={cn("grid gap-6", className)} {...$$restProps}>
    <Button variant="outline" type="button" on:click={open_google} disabled={isLoading}>
        {#if isLoading}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
        {:else}
            <Mail class="mr-2 h-4 w-4" />
        {/if}
        Google
    </Button>
</div>
