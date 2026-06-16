import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import mjml2html from "mjml";
import { db, KV } from "$server/db";
import { KVEndpoint } from "$constants";
import { TEMPLATE } from "$server/db/schema";
import { getGmailSMTP, getResend } from "../v1/providers";
import { checkDailyLimit } from "$server/email-limits";

export default new Hono().post(
    "/:project/:name/test",
    zValidator("param", z.object({ project: z.string(), name: z.string() })),
    zValidator("json", z.object({ to: z.string().email() })),
    async (c) => {
        const params = c.req.valid("param");
        const { to } = c.req.valid("json");
        const template = await db.query.TEMPLATE.findFirst({
            where: and(eq(TEMPLATE.project, params.project), eq(TEMPLATE.name, params.name)),
        });
        if (!template) return c.json({ message: "Template not found" }, 404);

        // Render the current (saved) template with its own variable values.
        let html = template.template ?? "";
        for (const v of template.variables) {
            html = html.replaceAll("{{" + v.name + "}}", v.value);
        }
        let rendered: string;
        try {
            rendered = (await mjml2html(html)).html;
        } catch {
            return c.json({ message: "Template failed to compile" }, 400);
        }
        const subject = `[Test] ${template.name}`;

        const limit = await checkDailyLimit(1);
        if (limit) {
            return c.json(
                {
                    message: "Daily email limit reached",
                    data: { used: limit.used, limit: limit.limit, remaining: limit.remaining },
                },
                429,
            );
        }

        const transporter = await getGmailSMTP(true);
        if (transporter) {
            try {
                const from = (await KV.get(KVEndpoint.gmail_smtp_user)) || "munbun";
                const info = await (
                    transporter as Exclude<typeof transporter, boolean>
                ).sendMail({ from, to, subject, html: rendered });
                return c.json({ message: "Test email sent via Gmail", data: info.messageId });
            } catch {
                return c.json({ message: "Gmail failed to send the test email" }, 502);
            }
        }

        const resend = await getResend(true);
        if (resend) {
            const { data, error } = await (
                resend as Exclude<typeof resend, boolean>
            ).emails.send({ from: "onboarding@resend.dev", to, subject, html: rendered });
            if (error) return c.json({ message: "Resend failed to send the test email" }, 502);
            return c.json({ message: "Test email sent via Resend", data: data?.id ?? "" });
        }

        return c.json(
            {
                message:
                    "No email provider configured. Set up Gmail SMTP or Resend in Settings → Email service.",
            },
            400,
        );
    },
);
