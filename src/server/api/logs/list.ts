import { Hono } from "hono";
import { desc } from "drizzle-orm";
import { db } from "$server/db";
import { logTable } from "$server/db/schema";

export default new Hono().get("/logs", async (c) => {
    const list = await db.query.logTable.findMany({
        limit: 100,
        orderBy: desc(logTable.created_at),
    });
    return c.json({ data: list });
});
