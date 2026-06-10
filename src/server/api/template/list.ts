import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "$server/db";
import { TEMPLATE } from "$server/db/schema";

export default new Hono().get(
    "/:project/all",
    zValidator("param", z.object({ project: z.string() })),
    async (c) => {
        const params = c.req.valid("param");
        const list = await db.query.TEMPLATE.findMany({
            where: eq(TEMPLATE.project, params.project),
        });
        return c.json({ data: list });
    },
);
