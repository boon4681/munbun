import { db } from "$server/db";
import { DEPLOYMENT, PROJECT, TEMPLATE } from "$server/db/schema";
import { zValidator } from '@hono/zod-validator'
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import mjml2html from 'mjml';
import z from "zod";
import { getGmailSMTP } from "./providers";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import nodemailer from "nodemailer";

const headers = z.object({
    'X-API-KEY': z.string()
})

const body = z.object({
    subject: z.string(),
    template: z.string(),
    to: z.array(z.string()),
    data: z.record(z.string(), z.string()),
    deploy: z.string().optional()
})
export default new Hono().post("/gmail/send", zValidator("header", headers), zValidator("json", body), async (c) => {
    const header = c.req.valid("header")
    const validated = c.req.valid("json")
    const project = await db.query.PROJECT.findFirst({
        where: eq(PROJECT.api_key, header['X-API-KEY'])
    })
    if (!project) return c.json({ message: "Project or Template not found" }, 404)
    const template = await db.query.TEMPLATE.findFirst({
        where: and(
            eq(TEMPLATE.project, project.id),
            eq(TEMPLATE.name, validated.template)
        )
    })
    if (!template) return c.json({ message: "Project or Template not found" }, 404)
    const deploy = await db.query.DEPLOYMENT.findFirst({
        where: and(
            ...[
                eq(DEPLOYMENT.project, project.id),
                eq(DEPLOYMENT.template_name, template.name),
                validated.deploy ? eq(DEPLOYMENT.id, validated.deploy) : undefined
            ].filter(a => a)
        ),
        orderBy: desc(DEPLOYMENT.created_at)
    })
    if (!deploy) return c.json({ message: "Deployment not found" }, 404)
    const transporter: false | nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = await getGmailSMTP(true) as any
    if (transporter == false) return c.json({ message: "Gmail SMTP is not setup properly" }, 400)
    let html = deploy.template ?? ""
    for (const v of deploy.variables) {
        if (!validated.data[v.name]) {
            return c.json({ message: "Error missing " + JSON.stringify(v.name) + " variable" }, 400)
        }
    }
    for (const v of deploy.variables) {
        html = html.replaceAll("{{" + v.name + "}}", validated.data[v.name])
    }
    try {
        const result = await mjml2html(html)
        const info = await transporter.sendMail({
            from: `"KMITL Science Room Booking" <dev-sci@kmitl.ac.th>`,
            to: validated.to,
            subject: validated.subject,
            html: result.html,
        });
        return c.json({ message: "Email sended", data: info.messageId })
    } catch (error) {
        return c.json({
            message: "Invalid mjml",
            data: ""
        })
    }
})
