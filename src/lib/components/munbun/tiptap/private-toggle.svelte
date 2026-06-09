<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const toggleVariants = tv({
		base: "hover:bg-muted aspect-[1/1] hover:text-muted-foreground focus-visible:ring-ring data-[state=on]:bg-accent data-[state=on]:text-accent-foreground inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-transparent",
				outline: "border-input hover:bg-accent hover:text-accent-foreground border bg-transparent shadow-sm",
			},
			size: {
				default: "h-9 min-w-9 px-3",
				sm: "h-8 min-w-8 px-2",
				lg: "h-10 min-w-10 px-3",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
	export type ToggleSize = VariantProps<typeof toggleVariants>["size"];
	export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	//@ts-ignore
	import type { WithElementRef } from "bits-ui";
	import type { HTMLButtonAttributes } from "svelte/elements";
	interface Props {
		pressed?: boolean;
		class?: string;
		variant?: ToggleVariant;
		size?: ToggleSize;
		children?: Snippet;
	}
	type ToggleProps = Props & WithElementRef<HTMLButtonAttributes>;
	let {
		pressed = $bindable(false),
		class: className,
		size = "default",
		variant = "default",
		children,
		...restProps
	}: ToggleProps = $props();
</script>

<button data-state={pressed ? "on" : ""} class={cn(toggleVariants({ variant, size }), className)} {...restProps}>
	{@render children?.()}
</button>
