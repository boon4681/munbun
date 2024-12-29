import type { LayoutServerLoad } from "./$types";
import { error, json, redirect } from '@sveltejs/kit';
import { JWT } from "@/server/jwt";
import { CookieName } from "@/server/constants";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
    const token = cookies.get(CookieName)
    if (token && await JWT.verified(token)) {
        return {}
    }
    return redirect(300, "/")
}