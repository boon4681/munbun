import { KVEndpoint } from "$constants"
import { KV } from "$server/db"
import { Hono } from "hono";
import nodemailer from "nodemailer";
import { Resend } from 'resend';

export const getGmailSMTP = async (prepare = false) => {
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

export const getResend = async (prepare = false) => {
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

export default new Hono().get("/providers", async (c) => {
    const providers: string[] = []
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
