import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "$server/db";
import { USER } from "$server/db/schema";

export default new Hono().post(
    "/",
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
        const validated = c.req.valid("json");
        const user = await db.query.USER.findFirst({
            where: eq(USER.email, validated.email),
        });
        if (user) return c.json({ message: "This user is already exist" }, 400);
        await db.insert(USER).values({ email: validated.email });
        return c.json({ data: "" });
    },
);
