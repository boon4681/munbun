<script>
    import { Button } from "@/components/ui/button";
    import Plus from "lucide-svelte/icons/plus";
</script>

<div class="flex container border-b min-h-24">
    <div class="w-full">
        <div class="text-4xl">Projects</div>
        <div class="text-muted-foreground">Manage your projects</div>
    </div>
    <Button>
        <Plus class="mr-2 h-4 w-4" />
        Create Project
    </Button>
</div>
