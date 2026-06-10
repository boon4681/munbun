import { CookieName, KVEndpoint } from "$constants";
import { KV } from "$server/db";
import { JWT } from "$server/jwt";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
    const token = cookies.get(CookieName);
    if (token && (await JWT.verified(token))) {
        return redirect(302, "/");
    }
    return {
        setup: (await KV.get(KVEndpoint.setup)) == "true",
    };
};
