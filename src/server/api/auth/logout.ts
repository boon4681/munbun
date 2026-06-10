import { Hono } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { html } from "hono/html";
import { env } from "$env/dynamic/private";
import { CookieName } from "$constants";

export default new Hono().get("/logout", async (c) => {
    const token = getCookie(c, CookieName);
    if (token) {
        deleteCookie(c, CookieName);
    }
    const redirect = env.LOGOUT_REDIRECT_ENDPOINT ?? "/login";
    return c.html(
        html`<script>
            window.localStorage.removeItem("${CookieName}");
            window.location.pathname = "${redirect}";
        </script>`,
    );
});
