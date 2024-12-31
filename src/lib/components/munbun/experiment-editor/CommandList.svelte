<script lang="ts">
	export let selectedIndex = 0;
	import { slashVisible, slashItems, slashLocaltion, slashProps } from "@/store";

	let height:number;

	let elements:HTMLElement[] = [];
	$: {
		if (elements[0] != null) {
			elements[selectedIndex]?.scrollIntoView({ block: "end", behavior: "smooth" });
		}
	}
</script>

<svelte:window bind:innerHeight={height} />
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if $slashVisible}
	<div class="w-full fixed h-screen top-0" on:click={() => ($slashVisible = false)}></div>
	<div
		class="absolute bg-white shadow-xl w-96 h-96 max-w-full rounded-lg overflow-scroll text-black"
		style="left: {$slashLocaltion.x}px; top: {$slashLocaltion.y + $slashLocaltion.height + 384 > height
			? $slashLocaltion.y - $slashLocaltion.height - 384
			: $slashLocaltion.y + $slashLocaltion.height}px;"
	>
		<div class="p-2 text-sm text-slate-500">BLOCKS</div>
		{#each $slashItems as { title, subtitle, command }, i}
			<div
				class="p-3 cursor-pointer {i == selectedIndex ? 'bg-slate-100' : 'bg-white'}"
				on:mouseenter={() => (selectedIndex = i)}
				on:click={() => {
					$slashVisible = false;
					(command as any)($slashProps);
				}}
				bind:this={elements[i]}
			>
				<div class="">{title}</div>
				<div class="text-sm text-slate-500">{subtitle ? subtitle : ""}</div>
			</div>
		{/each}
	</div>
{/if}
