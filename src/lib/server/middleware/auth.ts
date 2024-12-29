import db from "$db";
import { USER } from "$schema";
import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { decode, verify } from "hono/jwt";
import type { MiddlewareHandler } from "hono/types";
import type { JWTPayload } from "hono/utils/jwt/types";

type AuthOptions = {
    jwt: {
        secret: string,
        cookie?: string,
    }
}

type RoleOptions = {
    excluded?: boolean
    roles: string[]
}

export const useAuth = ({ jwt }: AuthOptions): MiddlewareHandler => {
    return async (c, next) => {
        const token = getCookie(c, jwt.cookie ?? 'token') ?? c.req.header('Authorization')?.split("Bearer ")[1]
        if (!token) throw new HTTPException(401, { message: 'Unauthorized' })
        let payload: JWTPayload | undefined = undefined
        try {
            payload = await verify(token, jwt.secret)
        } catch (error) { }
        if (!payload) throw new HTTPException(401, { message: 'Unauthorized' })
        const user = await db.query.USER.findFirst({
            where: eq(USER.email, payload.email as string),
        })
        if (!user) throw new HTTPException(401, { message: 'Unauthorized' })
        c.set("jwtPayload", payload);
        c.set("user", { ...payload })
        await next()
    }
}

export const useRole = ({ roles, excluded }: RoleOptions): MiddlewareHandler => {
    return async (c, next) => {
        const user = c.get("user")
        if (roles && !roles.includes(user.role!)) {
            if (excluded && roles.includes(user.role!)) {
                throw new HTTPException(403, { message: 'Forbidden' })
            }
            if (!excluded && !roles.includes(user.role!)) {
                throw new HTTPException(403, { message: 'Forbidden' })
            }
        }
        await next()
    }
}