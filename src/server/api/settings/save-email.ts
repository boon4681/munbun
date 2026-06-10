import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { KV } from "$server/db";
import { KVEndpoint } from "$constants";

export default new Hono().post(
    "/email",
    zValidator(
        "json",
        z.object({
            resend_api_key: z.string().optional(),
            gmail_smtp_user: z.string().optional(),
            gmail_smtp_pass: z.string().optional(),
        }),
    ),
    async (c) => {
        const validated = c.req.valid("json");
        if (validated.resend_api_key !== undefined) {
            await KV.set(KVEndpoint.resend_api_key, validated.resend_api_key);
        }
        if (validated.gmail_smtp_user !== undefined) {
            await KV.set(KVEndpoint.gmail_smtp_user, validated.gmail_smtp_user);
        }
        if (validated.gmail_smtp_pass !== undefined) {
            await KV.set(KVEndpoint.gmail_smtp_pass, validated.gmail_smtp_pass);
        }
        return c.json({ message: "Email config saved", data: "" });
    },
);
