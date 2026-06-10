import { CookieName, KVEndpoint } from "$constants";
import { db, KV } from "$server/db";
import { USER } from "$server/db/schema";
import { JWT } from "$server/jwt";
import { eq } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const token = cookies.get(CookieName);
    const payload = token ? await JWT.verified<{ email: string }>(token) : false;
    if (!payload) {
        return redirect(302, "/login");
    }
    const user = await db.query.USER.findFirst({
        where: eq(USER.email, payload.email),
    });
    if (!user) {
        return redirect(302, "/login");
    }

    const resend = (await KV.get(KVEndpoint.resend_api_key)) ?? "";
    const gmailUser = (await KV.get(KVEndpoint.gmail_smtp_user)) ?? "";
    const gmailPass = (await KV.get(KVEndpoint.gmail_smtp_pass)) ?? "";
    const ready = resend.length > 0 || (gmailUser.length > 0 && gmailPass.length > 0);

    return {
        user: { id: user.id, email: user.email, role: user.role },
        ready,
    };
};
