<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { page } from "$app/state";
    import FolderKanban from "@lucide/svelte/icons/folder-kanban";
    import ScrollText from "@lucide/svelte/icons/scroll-text";
    import Users from "@lucide/svelte/icons/users";
    import Settings from "@lucide/svelte/icons/settings";
    import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
    import LogOut from "@lucide/svelte/icons/log-out";

    let { user }: { user: { email: string; role: string } } = $props();

    const items = [
        { title: "Projects", url: "/projects", icon: FolderKanban },
        { title: "Logs", url: "/logs", icon: ScrollText },
        { title: "Users", url: "/users", icon: Users },
        { title: "Settings", url: "/settings", icon: Settings },
    ];

    const isActive = (url: string) =>
        page.url.pathname === url || page.url.pathname.startsWith(url + "/");
</script>

<Sidebar.Root>
    <Sidebar.Header>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton size="lg">
                    {#snippet child({ props })}
                        <a href="/" {...props}>
                            <div
                                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                            >
                                <img src="/logo.svg" alt="Munbun" class="size-5" />
                            </div>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-semibold">Munbun</span>
                                <span class="truncate text-xs text-muted-foreground">Email templates</span>
                            </div>
                        </a>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Header>

    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each items as item (item.url)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton isActive={isActive(item.url)} tooltipContent={item.title}>
                                {#snippet child({ props })}
                                    <a href={item.url} {...props}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Footer>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        {#snippet child({ props })}
                            <Sidebar.MenuButton
                                size="lg"
                                {...props}
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div
                                    class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                                >
                                    {user.email.charAt(0).toUpperCase()}
                                </div>
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-medium">{user.email}</span>
                                    <span class="truncate text-xs text-muted-foreground">{user.role}</span>
                                </div>
                                <ChevronsUpDown class="ml-auto size-4" />
                            </Sidebar.MenuButton>
                        {/snippet}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content side="top" align="end" class="w-56">
                        <DropdownMenu.Label>
                            <div class="grid text-sm leading-tight">
                                <span class="truncate font-medium">{user.email}</span>
                                <span class="truncate text-xs text-muted-foreground">{user.role}</span>
                            </div>
                        </DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item>
                            {#snippet child({ props })}
                                <a href="/api/auth/logout" {...props}>
                                    <LogOut class="size-4" />
                                    Log out
                                </a>
                            {/snippet}
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Footer>
    <Sidebar.Rail />
</Sidebar.Root>
