<script lang="ts">
	import "./layout.css";
	import { Toaster } from "svelte-sonner";

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/logo.svg" /></svelte:head>
<Toaster richColors closeButton position="bottom-right" />
{@render children()}
