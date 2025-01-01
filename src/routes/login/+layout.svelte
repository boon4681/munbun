<script lang="ts">
	import { Toaster } from "svelte-sonner";
	import type { LayoutServerData } from "./$types";
	export let data: LayoutServerData;
	import { ModeWatcher } from "mode-watcher";
	import { onMount } from "svelte";
	import { redirect } from "@sveltejs/kit";
	import MunbunLogin from "@/components/munbun/auth/munbun-login.svelte";
	onMount(() => {
		if (data.login) {
			redirect(300, "/");
		}
	});
</script>

{#if data.login}
	<slot></slot>
{:else if !data.setup}
	<div class="lg:p-8 w-full max-w-screen-sm mx-auto border mt-[200px]">
		<h1 class="text-2xl font-semibold tracking-tight">Munbun</h1>
		<div class="mb-4 text-muted-foreground">Create Superuser account</div>
		<MunbunLogin></MunbunLogin>
	</div>
{:else}
	<div class="lg:p-8 w-full max-w-screen-sm mx-auto border mt-[200px]">
		<h1 class="text-2xl font-semibold tracking-tight">Munbun</h1>
		<div class="mb-4 text-muted-foreground">Login</div>
		<MunbunLogin></MunbunLogin>
	</div>
{/if}
