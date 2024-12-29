import type { LayoutServerLoad } from "./$types";
import { KV } from "@/server/db";
import { JWT } from "@/server/jwt";
import { CookieName } from "@/server/constants";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
    const token = cookies.get(CookieName)
    let login = false
    if (token && await JWT.verified(token)) {
        login = true
    }
    return {
        setup: (await KV.get("setup")) == "true",
        login: login
    };
}