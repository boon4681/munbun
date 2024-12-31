
import { CookieName, KVEndpoint } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { jwt_secret } from '@/server/jwt';
import { createRouter } from '@/server/utils';
import db, { KV } from '@/server/db';
import { GetProviders, GMailSendEmail, ResendSendEmail } from './v1.openapi';
import { and, eq } from 'drizzle-orm';
import { PROJECT, TEMPLATE } from '@/server/db/schema';
import { Resend } from 'resend';
import nodemailer from "nodemailer";
import mjml2html from 'mjml';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const getGmailSMTP = async (prepare = false) => {
    const gmail_user = await KV.get(KVEndpoint.gmail_smtp_user) ?? ""
    const gmail_pass = await KV.get(KVEndpoint.gmail_smtp_pass) ?? ""
    if (gmail_user.length == 0) return false
    if (gmail_pass.length == 0) return false
    if (!prepare) return true
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: gmail_user,
            pass: gmail_pass,
        },
        tls: {
            rejectUnauthorized: false,
        },
        secure: false,
    });
    return transporter
}

const getResend = async (prepare = false) => {
    const resend_api_key = await KV.get(KVEndpoint.resend_api_key)
    if (resend_api_key?.length == 0) return false
    if (!prepare) return true
    try {
        const resend = new Resend(resend_api_key);
        return resend
    } catch (error) {
        return false
    }
}

const RouteGetProviders = createRouter().openapi(GetProviders, async (c) => {
    const providers = []
    if (await getGmailSMTP()) {
        providers.push("gmail.smtp")
    }
    if (await getResend()) {
        providers.push("resend")
    }
    return c.json({
        data: providers
    })
})

const RouteResendSendEmail = createRouter().openapi(ResendSendEmail, async (c) => {
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
    const resend: false | Resend = await getResend(true) as any
    if (resend == false) return c.json({ message: "Resend is not setup properly" }, 400)
    let html = template.template ?? ""
    for (const v of template.variables) {
        if (!validated.data[v.name]) {
            return c.json({ message: "Error missing " + JSON.stringify(v.name) + " variable" }, 400)
        }
    }
    for (const v of template.variables) {
        html = html.replaceAll("{{" + v.name + "}}", validated.data[v.name])
    }
    const result = mjml2html(html)

    const { data, error } = await resend.emails.send({
        from: validated.from,
        to: validated.to,
        subject: validated.subject ?? "MUNBUN",
        html: result.html,
    });

    if (error) {
        console.error({ error });
        return c.json({ message: "Error" })
    }

    console.log({ data });
    return c.json({ message: "Email Sent", data: data })
})

const RouteGMailSendEmail = createRouter().openapi(GMailSendEmail, async (c) => {
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
    const transporter: false | nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = await getGmailSMTP(true) as any
    if (transporter == false) return c.json({ message: "Gmail SMTP is not setup properly" }, 400)
    let html = template.template ?? ""
    for (const v of template.variables) {
        if (!validated.data[v.name]) {
            return c.json({ message: "Error missing " + JSON.stringify(v.name) + " variable" }, 400)
        }
    }
    for (const v of template.variables) {
        html = html.replaceAll("{{" + v.name + "}}", validated.data[v.name])
    }
    try {
        const result = mjml2html(html)
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

const app = createRouter()
    .route("", RouteGetProviders)
    .route("", RouteResendSendEmail)
    .route("", RouteGMailSendEmail)

export default app