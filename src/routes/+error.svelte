<script>
    import { page } from "$app/stores";
</script>

<div class="container mx-auto pt-[100px] flex flex-col justify-center">
    {#if $page?.status}
        <h1 class="text-4xl">Page status: {$page?.status}</h1>
    {/if}
    <h2>It seems there has been an error, sorry about that.</h2>
    {#if $page?.error}
        {#if $page?.error?.message}
            <p>Error message: {$page?.error?.message}</p>
        {/if}
    {/if}
    <div>
        <a href="/" class="hover:underline">Back to home</a>
    </div>
</div>
