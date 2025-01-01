import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import color from "tinycolor2";

export function djb2(str: string) {
    let hash = 5383;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i);
    }
    return hash;
}

export function generateGradient(username: string) {
    const c1 = color({ h: djb2(username) % 360, s: 0.95, l: 0.5 });
    const second = c1.triad()[1].toHexString();

    return {
        fromColor: c1.toHexString(),
        toColor: second,
    };
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

const date = new Intl.RelativeTimeFormat('en')

export const time_format = (time: number) => {
	time = time / 1000
	const u = [60, 60 * 60, 24 * 60 * 60]
	const p = ['minutes', 'hours', 'days']
	let o = 'seconds'
	let t = time
	let j = 1
	for (const i in u) {
		if (Math.abs(time) > u[i]) {
			j = u[i]
			o = p[i]
		}
	}
	t /= j
	return date.format(Math.round(t), o as any)
}

export type StripResponse<T extends (...args: any) => any> = Awaited<ReturnType<T>>