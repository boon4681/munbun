import { Hono } from "hono";
import { googleAuth } from "@hono/oauth-providers/google";
import { setCookie } from "hono/cookie";
import { html } from "hono/html";
import { eq } from "drizzle-orm";
import { env } from "$env/dynamic/private";
import { db, KV } from "$server/db";
import { USER } from "$server/db/schema";
import { CookieName, KVEndpoint } from "$constants";
import { JWT } from "$server/jwt";

export default new Hono()
    .get(
        "/google",
        googleAuth({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            scope: ["openid", "email", "profile"],
            redirect_uri: env.GOOGLE_REDIRECT_DEVELOPMENT,
        }),
        async (c) => {
            const user = c.get("user-google")!;
            let userAuth = await db.query.USER.findFirst({
                where: eq(USER.email, user.email!),
            });
            const users = await db.query.USER.findMany();
            if (users.length == 0) {
                await KV.set(KVEndpoint.setup, "false");
            }
            if (!userAuth && (await KV.get(KVEndpoint.setup)) == "true") {
                console.error("ERROR: superadmin already setup");
                return c.html(
                    html`<script>
                        window.localStorage.removeItem("${CookieName}");
                        window.close();
                    </script>`,
                    400,
                );
            }
            if (!userAuth) {
                await db.insert(USER).values({
                    email: user.email!,
                    last_login: new Date().toISOString().split(".")[0],
                    created_at: new Date().toISOString().split(".")[0],
                });
                userAuth = await db.query.USER.findFirst({
                    where: eq(USER.email, user.email!),
                });
            }
            if ((await KV.get(KVEndpoint.setup)) == "false") {
                await KV.set(KVEndpoint.setup, "true");
            }
            const signed = await JWT.signed({ ...user, id: userAuth!.id });
            setCookie(c, CookieName, signed);
            return c.html(
                html`<script>
                    window.localStorage.setItem("${CookieName}", "${signed}");
                    window.close();
                </script>`,
            );
        },
    )
    .onError((err, c) => {
        console.error(err);
        return c.html(
            html`<script>
                window.localStorage.removeItem("${CookieName}");
                window.close();
            </script>`,
        );
    });
