import type { Context, MiddlewareHandler, Next } from "hono";
import { getPath } from "hono/utils/url"
import db, { KV } from "./db";
import { logTable } from "./db/schema";
import { getCookie } from "hono/cookie";
import { CookieName, KVEndpoint } from "./constants";
import type { JWTPayload } from "jose";
import { decode, verify } from "hono/jwt";
export const dbLogger: MiddlewareHandler = async (c: Context, next: Next) => {
    const { method } = c.req
    const path = getPath(c.req.raw)
    let message: Record<string, any> = {
        request: {
            method,
            path
        },
    }
    const start = Date.now()
    await next()
    const { status } = c.res
    message["response"] = {
        status,
        ok: String(c.res.ok),
        time: time(start),
    }
    const token = getCookie(c, CookieName ?? 'token') ?? c.req.header('Authorization')?.split("Bearer ")[1]
    if (token) {
        let payload: JWTPayload | undefined = undefined
        try {
            payload = await verify(token, await KV.get(KVEndpoint.jwt_secret) as any)
            message["user"] = {
                email: payload.email,
                picture: `/api/avatar/${payload.id}`
            }
        } catch (error) { }
    }
    if (c.error) {
        message['error'] = {
            message: c.error.message,
            stack: c.error.stack,
            cause: c.error.cause
        }
    }
    if (!path.startsWith("/api/logs")) {
        await db.insert(logTable).values({
            message: JSON.stringify(message),
            tag: c.error ? "error" : path.startsWith("/api/auth") ? "auth" : "http",
            status: String(status)
        })
    }
}

function humanize(times: string[]): string {
    const [delimiter, separator] = [",", "."]
    const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter))

    return orderTimes.join(separator)
}

function time(start: number): string {
    const delta = Date.now() - start

    return humanize([delta < 1000 ? delta + "ms" : Math.round(delta / 1000) + "s"])
}