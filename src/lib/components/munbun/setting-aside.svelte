<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { createEventDispatcher, onMount } from "svelte";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import type { Path, PathLink } from "@/paths";
    import { base } from "$app/paths";
    const dispatch = createEventDispatcher();
    import { page } from "$app/stores";
    import Menu from "lucide-svelte/icons/menu"
    import { sidebar } from "@/store.js";
    import Button from "@/components/ui/button/button.svelte";
    import { build, match } from "@/route.js";
    import type { ButtonProps } from "@/components/ui/button/index.js";
    const params = (key: string): string => {
        return $page.params[key];
    };
    type $$Props = HTMLAttributes<HTMLDivElement> & {
        paths: (helper: { params: (key: string) => string }) => Record<string, Path[]> | Record<string, Path[]>;
    };
    export const csr = true;
    export const ssr = false;
    export let paths: $$Props["paths"];
    let _paths_ = typeof paths == "function" ? paths({ params }) : paths;

    let pathname = "undefinded";
    onMount(() => {
        pathname = window.location.pathname;
    });
    afterNavigate(() => {
        pathname = window.location.pathname;
    });
    beforeNavigate(() => {
        sidebar.set(false);
    });
    const variant = (pathname: string, path: PathLink): ButtonProps["variant"] => {
        if (typeof path.match === "string") {
            if (match(pathname, build(path.match)) || path.active) {
                return "settingActive";
            } else {
                return "setting";
            }
        } else {
            if (path.match.map((a) => match(pathname, build(a))).some((a) => a) || path.active) {
                return "settingActive";
            } else {
                return "setting";
            }
        }
    };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="sticky top-0 left-0 z-[1000] h-screen">
    <div
        on:click={() => sidebar.set(false)}
        class:opacity-0={!$sidebar}
        class:pointer-events-none={!$sidebar}
        class="absolute transition-opacity top-0 left-0 w-screen h-full backdrop-blur-sm md:hidden"
    ></div>
    <div
        class:-translate-x-[100%]={!$sidebar}
        class="w-[240px] bg-background p-2 h-full px-2 shadow-xl border-r md:translate-x-0 transform transition-all shrink-0 flex flex-col gap-6 py-6 absolute md:relative"
    >
        <Button
            on:click={() => sidebar.set(!$sidebar)}
            variant="outline"
            size="sm"
            class="absolute top-3 left-full rounded-l-none md:hidden"
        >
            <Menu size={16}></Menu>
        </Button>
        <slot></slot>
        {#each Object.keys(_paths_) as k}
            <div class="flex flex-col gap-2">
                <div class="font-semibold">
                    {k}
                </div>
                {#each _paths_[k] as path}
                    {#if path.button == true}
                        <Button
                            class="h-11 justify-start gap-3"
                            variant={path.active ? "settingActive" : "setting"}
                            size="sm"
                            on:click
                        >
                            {#if path.icon}
                                <svelte:component this={path.icon} size={20} />
                            {/if}
                            {path.name}
                        </Button>
                    {:else}
                        <Button
                            href={`${base}${path.to}`}
                            class="justify-start gap-3 h-11"
                            size="sm"
                            variant={variant(pathname, path)}
                        >
                            {#if path.icon}
                                <svelte:component this={path.icon} size={20} />
                            {/if}
                            {path.name}
                        </Button>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
</div>
