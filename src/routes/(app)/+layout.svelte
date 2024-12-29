<script>
    import { page } from "$app/stores";
    import Button from "@/components/ui/button/button.svelte";
    import { Archive } from "lucide-svelte";
    import Fingerprint from "lucide-svelte/icons/fingerprint";
    import Monitor from "lucide-svelte/icons/monitor";
    import Grid2x2 from "lucide-svelte/icons/grid-2x2";
    import SettingLayout from "@/components/munbun/setting-layout.svelte";
    import SettingAside from "@/components/munbun/setting-aside.svelte";
</script>

<div class="flex flex-col">
    <div class="p-2 px-4 border-b w-full">
        <a class="text-2xl" href="/">Munbun</a>
    </div>
    <SettingLayout>
        <SettingAside
            slot="aside"
            paths={() => ({
                "": [
                    {
                        name: "Projects",
                        to: "/",
                        match: "/",
                        icon: Grid2x2,
                    },
                    {
                        name: "Logs",
                        to: "/logs",
                        match: "/logs",
                        icon: Monitor,
                    },
                ],
            })}
        ></SettingAside>
        <div class="mt-10 md:mt-0">
            <div class="py-6 px-4">
                <slot></slot>
            </div>
        </div>
    </SettingLayout>
</div>
