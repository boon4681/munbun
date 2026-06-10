import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "$server/db";
import { PROJECT, TEMPLATE } from "$server/db/schema";

export default new Hono().post(
    "/:project/create",
    zValidator("param", z.object({ project: z.string() })),
    zValidator(
        "json",
        z.object({ name: z.string().min(1).max(32), description: z.string().optional() }),
    ),
    async (c) => {
        const params = c.req.valid("param");
        const validated = c.req.valid("json");
        const project = await db.query.PROJECT.findFirst({
            where: eq(PROJECT.id, params.project),
        });
        if (!project) return c.json({ message: "Project not found" }, 404);
        await db.insert(TEMPLATE).values({
            project: params.project,
            name: validated.name,
            description: validated.description,
        });
        return c.json({ message: "Template created" });
    },
);
