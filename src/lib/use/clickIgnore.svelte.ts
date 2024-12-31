import type { Action } from "svelte/action";

export const clickIgnore: Action<
    HTMLElement,
    undefined,
    {
        'on:clickIgnore': (e: MouseEvent) => void;
    }
> = (node, _data) => {
    const click = (e: MouseEvent) => {
        for (const child of node.querySelectorAll('[data-click-ignore]')) {
            if (child.contains(e.target as any)) {
                return
            }
        }
        node.dispatchEvent(new CustomEvent('clickIgnore'))
    }
    $effect(() => {
        node.addEventListener('click', click)
        return () => {
            node.removeEventListener('click', click)
        }
    })
}