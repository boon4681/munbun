import { CookieName } from "$constants";
import { db } from "$server/db";
import { USER } from "$server/db/schema";
import { JWT } from "$server/jwt";
import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHandler } from "hono/types";

export type AuthUser = typeof USER["$inferSelect"] & Record<string, unknown>;

export type AuthVariables = {
    user: AuthUser;
};

type RoleOptions = {
    excluded?: boolean;
    roles: string[];
};

/**
 * Reads the JWT from the `munbun.token` cookie (or a `Bearer` Authorization
 * header), verifies it and loads the matching user onto the context.
 */
export const useAuth = (): MiddlewareHandler<{ Variables: AuthVariables }> => {
    return async (c, next) => {
        const token =
            getCookie(c, CookieName) ?? c.req.header("Authorization")?.split("Bearer ")[1];
        if (!token) throw new HTTPException(401, { message: "Unauthorized" });
        const payload = await JWT.verified<{ email: string }>(token);
        if (!payload) throw new HTTPException(401, { message: "Unauthorized" });
        const user = await db.query.USER.findFirst({
            where: eq(USER.email, payload.email),
        });
        if (!user) throw new HTTPException(401, { message: "Unauthorized" });
        c.set("user", { ...payload, ...user });
        await next();
    };
};

export const useRole = ({ roles, excluded }: RoleOptions): MiddlewareHandler<{ Variables: AuthVariables }> => {
    return async (c, next) => {
        const user = c.get("user");
        const role = user.role;
        if (roles && !roles.includes(role)) {
            if (excluded && roles.includes(role)) {
                throw new HTTPException(403, { message: "Forbidden" });
            }
            if (!excluded && !roles.includes(role)) {
                throw new HTTPException(403, { message: "Forbidden" });
            }
        }
        await next();
    };
};
