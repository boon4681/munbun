import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "$server/db";
import { PROJECT } from "$server/db/schema";

export default new Hono().post(
    "/create",
    zValidator(
        "json",
        z.object({ name: z.string().min(1).max(32), description: z.string().optional() }),
    ),
    async (c) => {
        const validated = c.req.valid("json");
        await db.insert(PROJECT).values({
            name: validated.name,
            description: validated.description,
        });
        return c.json({ message: "Project created" });
    },
);
