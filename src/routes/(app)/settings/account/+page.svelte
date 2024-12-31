<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs";
    import * as SimpleTable from "@/components/munbun/simple-table";

    import { me } from "@/store";
</script>

<h1 class="text-2xl font-semibold">Account</h1>
<h2 class="text-sm text-muted-foreground pb-4 border-b mb-4">Make changes to your account here.</h2>
<div>
    Email: {$me.email}
</div>
