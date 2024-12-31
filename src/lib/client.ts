import { hc } from "hono/client";
import type { HonoServerRef } from "../app";
let browserClient: ReturnType<typeof hc<HonoServerRef>>;

export const createClient = (fetch: Window['fetch']) => {
    const isBrowser = typeof window !== 'undefined';
    const origin = isBrowser ? window.location.origin : '';

    if (isBrowser && browserClient) {
        return browserClient;
    }

    const client = hc<HonoServerRef>(origin + '/api', { fetch });
    
    if (isBrowser) {
        browserClient = client;
    }

    return client;
};

export type HonoClient = ReturnType<typeof hc<HonoServerRef>>;