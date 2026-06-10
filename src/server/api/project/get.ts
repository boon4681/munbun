import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "$server/db";
import { PROJECT } from "$server/db/schema";

export default new Hono().get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
        const validated = c.req.valid("param");
        const project = await db.query.PROJECT.findFirst({
            where: eq(PROJECT.id, validated.id),
        });
        if (project) return c.json({ data: project });
        return c.json({ message: "Project not found" }, 404);
    },
);
