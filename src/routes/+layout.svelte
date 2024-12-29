<script lang="ts">
	import "../app.css";
	import { Toaster } from "svelte-sonner";
	import type { LayoutServerData } from "./$types";
	import MunbunLogin from "@/components/munbun/auth/munbun-login.svelte";
	export let data: LayoutServerData;
</script>

<Toaster />
{#if data.login}
	<slot></slot>
{:else if !data.setup}
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
			</div>
			<MunbunLogin></MunbunLogin>
			<!-- <p class="text-muted-foreground px-8 text-center text-sm">
				By clicking continue, you agree to our
				<a href="/terms" class="hover:text-primary underline underline-offset-4"> Terms of Service </a>
				and
				<a href="/privacy" class="hover:text-primary underline underline-offset-4"> Privacy Policy </a>
				.
			</p> -->
		</div>
	</div>
{:else}
	<MunbunLogin></MunbunLogin>
{/if}
