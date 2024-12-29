import app, { type HonoServer } from "$server/server"
import { hc } from "hono/client";

let browserClient: ReturnType<typeof hc<HonoServer>>;

export const createClient = (fetch: Window['fetch']) => {
    const isBrowser = typeof window !== 'undefined';
    const origin = isBrowser ? window.location.origin : '';

    if (isBrowser && browserClient) {
        return browserClient;
    }

    const client = hc<HonoServer>(origin + '/api', { fetch });

    if (isBrowser) {
        browserClient = client;
    }

    return client;
};