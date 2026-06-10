import { Hono } from "hono";
import { db } from "$server/db";

export default new Hono().get("/all", async (c) => {
    const list = await db.query.PROJECT.findMany({
        columns: { name: true, description: true, id: true, created_at: true },
    });
    return c.json({ data: list });
});
