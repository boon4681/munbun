import { Hono } from "hono";
import { KV } from "$server/db";
import { KVEndpoint } from "$constants";

export default new Hono().get("/email", async (c) => {
    return c.json({
        data: {
            resend_api_key: (await KV.get(KVEndpoint.resend_api_key)) ?? "",
            gmail_smtp_user: (await KV.get(KVEndpoint.gmail_smtp_user)) ?? "",
            gmail_smtp_pass: (await KV.get(KVEndpoint.gmail_smtp_pass)) ?? "",
            daily_email_limit: Number((await KV.get(KVEndpoint.daily_email_limit)) ?? "500"),
        },
    });
});
