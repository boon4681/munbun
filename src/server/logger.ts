import type { Context, MiddlewareHandler, Next } from "hono";
import { getPath } from "hono/utils/url";
import { getCookie } from "hono/cookie";
import { db } from "$server/db";
import { logTable } from "$server/db/schema";
import { CookieName } from "$constants";
import { JWT } from "$server/jwt";

export const tagForPath = (path: string): "auth" | "email" | "http" => {
    if (path.startsWith("/api/auth")) return "auth";
    if (
        path.includes("/v1/gmail/send") ||
        path.includes("/v1/resend/send") ||
        /^\/api\/template\/[^/]+\/[^/]+\/test$/.test(path)
    ) {
        return "email";
    }
    return "http";
};


export const dbLogger: MiddlewareHandler = async (c: Context, next: Next) => {
    const { method } = c.req;
    const path = getPath(c.req.raw);
    const message: Record<string, unknown> = {
        request: { method, path },
    };
    const start = Date.now();
    await next();
    const { status } = c.res;
    message["response"] = {
        status,
        ok: String(c.res.ok),
        time: time(start),
    };
    const token =
        getCookie(c, CookieName) ?? c.req.header("Authorization")?.split("Bearer ")[1];
    if (token) {
        const payload = await JWT.verified<{ email: string; id: string }>(token);
        if (payload) {
            message["user"] = {
                email: payload.email,
                picture: `/api/avatar/${payload.id}`,
            };
        }
    }
    if (c.error) {
        message["error"] = {
            message: c.error.message,
            stack: c.error.stack,
            cause: c.error.cause,
        };
    }
    if (!path.startsWith("/api/logs")) {
        await db.insert(logTable).values({
            message: JSON.stringify(message),
            tag: c.error ? "error" : tagForPath(path),
            status: String(status),
        });
    }
};

function humanize(times: string[]): string {
    const [delimiter, separator] = [",", "."];
    const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));
    return orderTimes.join(separator);
}

function time(start: number): string {
    const delta = Date.now() - start;
    return humanize([delta < 1000 ? delta + "ms" : Math.round(delta / 1000) + "s"]);
}
