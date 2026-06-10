import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "$server/db";
import { DEPLOYMENT, TEMPLATE } from "$server/db/schema";

export default new Hono().get(
    "/:project/:name",
    zValidator("param", z.object({ project: z.string(), name: z.string() })),
    async (c) => {
        const params = c.req.valid("param");
        const template = await db.query.TEMPLATE.findFirst({
            where: and(eq(TEMPLATE.project, params.project), eq(TEMPLATE.name, params.name)),
        });
        if (!template) return c.json({ message: "Project or Template not found" }, 404);
        const deployment = await db.query.DEPLOYMENT.findMany({
            where: and(
                eq(DEPLOYMENT.project, params.project),
                eq(DEPLOYMENT.template_name, params.name),
            ),
            orderBy: desc(DEPLOYMENT.created_at),
        });
        return c.json({ data: deployment });
    },
);
