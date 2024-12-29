import type { SvelteComponentTyped } from "svelte";

export interface PathLink {
    name: string;
    match: string | string[];
    to: string;
    active?: boolean;
    icon?: typeof SvelteComponentTyped<any, any, any>;
    button?: false;
}
export interface PathButton {
    name: string;
    value: string;
    active?: boolean;
    icon?: typeof SvelteComponentTyped<any, any, any>;
    button: true;
}
export type Path = PathLink | PathButton;
export type Paths = Record<string, Path[]>