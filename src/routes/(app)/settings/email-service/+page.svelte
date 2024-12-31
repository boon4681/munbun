<script lang="ts">
    import { client } from "@/api";
    import Button from "@/components/ui/button/button.svelte";
    import { Input } from "@/components/ui/input";
    import { onMount } from "svelte";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";

    let show = false;
    let isLoading = false;
    let resend_api_key = "";
    let gmail_smtp_user = "";
    let gmail_smtp_pass = "";
    const save = async () => {
        if (isLoading) return;
        let start = Date.now();
        isLoading = true;
        await client.SaveEmailConfig({
            json: {
                resend_api_key,
                gmail_smtp_user,
                gmail_smtp_pass
            },
        });
        setTimeout(
            () => {
                isLoading = false;
                location.reload();
            },
            Math.max(1000, Date.now() - start),
        );
    };
    onMount(() => {});
</script>

<div class="flex justify-between items-center">
    <div>
        <h1 class="text-2xl font-semibold">Email Service</h1>
        <h2 class="text-sm text-muted-foreground pb-4 border-b mb-4">Make changes to your email service here.</h2>
    </div>
    <div>
        <Button class="w-32" disabled={isLoading} on:click={save}>
            {#if isLoading}
                <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
            {/if}
            Save
        </Button>
    </div>
</div>
{#if show}
    <div class="flex flex-col gap-2">
        <div>Resend:</div>
        <Input placeholder="API-KEY" bind:value={resend_api_key}></Input>
    </div>
    <div class="flex flex-col gap-2">
        <div>Gmail SMTP:</div>
        <Input placeholder="User" bind:value={gmail_smtp_user}></Input>
        <Input placeholder="Pass" bind:value={gmail_smtp_pass}></Input>
    </div>
{:else}
    <div class="flex h-[100px] justify-center items-center">
        <Button on:click={() => (show = true)}>Show Settings</Button>
    </div>
{/if}
<div>
    <!-- <SimpleTable.Root>
        <SimpleTable.Header>
            <SimpleTable.Row>
                <SimpleTable.Col class="w-16 shrink-0"></SimpleTable.Col>
                <SimpleTable.Col class="max-w-32">Provider</SimpleTable.Col>
                <SimpleTable.Col>Name</SimpleTable.Col>
            </SimpleTable.Row>
        </SimpleTable.Header>
        <SimpleTable.Body>
            <SimpleTable.Row>
                <SimpleTable.Col class="w-16 shrink-0 justify-center">
                    <Button class="size-8 p-2" variant="ghost">
                        <Trash2></Trash2>
                    </Button>
                </SimpleTable.Col>
                <SimpleTable.Col class="max-w-32">
                    Resend
                </SimpleTable.Col>
                <SimpleTable.Col>
                    HI
                </SimpleTable.Col>
            </SimpleTable.Row>
        </SimpleTable.Body>
    </SimpleTable.Root> -->
</div>
