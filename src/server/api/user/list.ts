import { Hono } from "hono";
import { db } from "$server/db";

export default new Hono().get("/all", async (c) => {
    const users = await db.query.USER.findMany();
    return c.json({ data: users });
});
