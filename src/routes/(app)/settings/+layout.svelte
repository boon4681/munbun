<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as SimpleTable from "@/components/munbun/simple-table";

    import { me } from "@/store";
</script>

<Tabs.Root
    value={$page.url.pathname.split("/settings/")[1]}
    class="w-full"
    onValueChange={(e) => {
        goto("/settings/" + e);
    }}
>
    <Tabs.List class="mb-4">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="email-service">Email Service</Tabs.Trigger>
    </Tabs.List>
    <div class="py-4 md:px-6 md:border w-full min-h-[600px] rounded-lg flex flex-col">
        <slot></slot>
    </div>
</Tabs.Root>
