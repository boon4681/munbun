import type { App } from '$server'
import { hc } from 'hono/client';
let browserClient: ReturnType<typeof hc<App>>;

export const createClient = (fetch: Window['fetch']) => {
    const isBrowser = typeof window !== 'undefined';
    const origin = isBrowser ? window.location.origin : '';

    if (isBrowser && browserClient) {
        return browserClient;
    }

    const client = hc<App>(origin, { fetch });

    if (isBrowser) {
        browserClient = client;
    }

    return client;
};

export type HonoClient = ReturnType<typeof hc<App>>;
