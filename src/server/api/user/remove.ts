import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "$server/db";
import { USER } from "$server/db/schema";
import type { AuthVariables } from "$server/middleware/auth";

export default new Hono<{ Variables: AuthVariables }>().delete(
    "/",
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
        const me = c.get("user");
        const validated = c.req.valid("json");
        const user = await db.query.USER.findFirst({
            where: eq(USER.email, validated.email),
        });
        if (!user) return c.json({ message: "User not found" }, 404);
        if (user.email == me.email) return c.json({ message: "You cannot remove yourself" }, 400);
        await db.delete(USER).where(eq(USER.email, validated.email));
        return c.json({ data: "" });
    },
);
