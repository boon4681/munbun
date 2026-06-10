import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "$server/db";
import { TEMPLATE } from "$server/db/schema";

export default new Hono().delete(
    "/:project/:name",
    zValidator("param", z.object({ project: z.string(), name: z.string() })),
    async (c) => {
        const params = c.req.valid("param");
        const template = await db.query.TEMPLATE.findFirst({
            where: and(eq(TEMPLATE.project, params.project), eq(TEMPLATE.name, params.name)),
        });
        if (template) {
            await db
                .delete(TEMPLATE)
                .where(and(eq(TEMPLATE.project, params.project), eq(TEMPLATE.name, params.name)));
            return c.json({ message: "Template deleted" });
        }
        return c.json({ message: "Template not found" }, 404);
    },
);
