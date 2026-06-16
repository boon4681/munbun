import { Hono } from "hono";
import { DateTime } from "luxon";
import { DB_PATH } from "$server/db";
import fs from "node:fs";

export default new Hono().get("/backup", async (c) => {
    if (!fs.existsSync(DB_PATH)) {
        return c.json({ error: "Database file not found" }, 404);
    }

    const buffer = fs.readFileSync(DB_PATH);
    const date = DateTime.utc().toFormat("yyyy-MM-dd");

    return c.body(buffer, 200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="munbun-backup-${date}.db"`,
        "Content-Length": String(buffer.length),
    });
});
