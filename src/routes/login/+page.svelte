<script lang="ts">
    import LoginButton from "$lib/components/munbun/login-button.svelte";

    let { data } = $props();
    let error = $state("");
</script>

<div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-sm flex flex-col gap-4">
        <img src="/logo.svg" alt="Munbun" class="mx-auto size-12" />
        <div class="text-2xl">Munbun</div>
        <div>
            {data.setup
                ? "Sign in to your account"
                : "Create the superuser account"}
        </div>
        {#if error}
            <div
                class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
                {error}
            </div>
        {/if}
        <LoginButton onerror={(message) => (error = message)} />
    </div>
</div>
