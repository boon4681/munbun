import type { LayoutServerLoad } from "./$types";
import { error, json, redirect } from '@sveltejs/kit';
import { JWT } from "@/server/jwt";
import { CookieName, KVEndpoint } from "@/server/constants";
import { KV } from "@/server/db";
import { createClient } from "@/client";
import { api } from "@/api.utils";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
    const token = cookies.get(CookieName)
    if (token && await JWT.verified(token)) {
        const client = createClient(fetch)
        const providers = await api(client.v1.providers.$get)
        return {
            ready: providers.length > 0
        }
    }
    return redirect(300, "/login")
}