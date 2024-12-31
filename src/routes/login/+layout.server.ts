import type { LayoutServerLoad } from "./$types";
import { KV } from "@/server/db";
import { JWT } from "@/server/jwt";
import { CookieName, KVEndpoint } from "@/server/constants";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
    const token = cookies.get(CookieName)
    let login = false
    if (token && await JWT.verified(token)) {
        login = true
    }
    if (login) {
        return redirect(300, "/")
    }
    return {
        setup: (await KV.get(KVEndpoint.setup)) == "true",
        login: login
    };
}