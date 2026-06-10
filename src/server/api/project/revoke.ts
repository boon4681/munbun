import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { db } from "$server/db";
import { PROJECT } from "$server/db/schema";

export default new Hono().patch(
    "/:id/api-key",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
        const validated = c.req.valid("param");
        const project = await db.query.PROJECT.findFirst({
            where: eq(PROJECT.id, validated.id),
        });
        if (project) {
            await db
                .update(PROJECT)
                .set({ api_key: [createId(), createId(), createId()].join(".") })
                .where(eq(PROJECT.id, validated.id));
            return c.json({ data: project.api_key });
        }
        return c.json({ message: "Project not found" }, 404);
    },
);
