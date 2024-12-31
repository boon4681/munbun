<script>
    import Button from "@/components/ui/button/button.svelte";
    import SettingLayout from "@/components/munbun/setting-layout.svelte";
    import SettingAside from "@/components/munbun/setting-aside.svelte";
    import Logo from "@/components/munbun/logo.svelte";

    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";
    import { toggleMode } from "mode-watcher";
    import Auth from "@/components/munbun/auth/auth.svelte";
    import { onMount } from "svelte";
    import { ready } from "@/store";
    import { router } from "@/router";
    export let data;

    onMount(() => {
        ready.set(data.ready);
    });
</script>

<Auth>
    <div class="flex flex-col w-full">
        <div class="p-2 px-4 border-b w-full flex items-center">
            <Logo class="size-12 mr-2"></Logo>
            <a class="text-2xl" href="/">Munbun</a>
            <Button class="ml-auto" on:click={toggleMode} variant="outline" size="icon">
                <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon
                    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
                <span class="sr-only">Toggle theme</span>
            </Button>
        </div>
        <SettingLayout>
            <SettingAside slot="aside" paths={() => router()}></SettingAside>
            <div class="mt-10 md:mt-0">
                <div class="py-6 md:px-4">
                    <div class="lg:container">
                        {#if !$ready}
                            <div class="border border-red-500 my-4 px-6 py-4 bg-orange-500/20 text-red-400">
                                Please set <b>Resend API-KEY</b> or <b>Gmail SMTP</b> in "settings" {">"} "email-service"
                            </div>
                        {/if}
                        <slot></slot>
                    </div>
                </div>
            </div>
        </SettingLayout>
    </div>
</Auth>
