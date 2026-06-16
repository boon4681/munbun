import { Hono } from "hono";
import { DB_PATH, reload } from "$server/db";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "$server/db/schema";
import fs from "node:fs";
import path from "node:path";

export default new Hono().post("/restore", async (c) => {
    const buffer = Buffer.from(await c.req.raw.arrayBuffer());

    if (buffer.length === 0) {
        return c.json({ error: "No data received" }, 400);
    }

    const tmpPath = DB_PATH + ".restore-tmp";
    const backupPath = DB_PATH + ".prev-backup";

    try {
        fs.writeFileSync(tmpPath, buffer);

        if (fs.existsSync(DB_PATH)) {
            fs.copyFileSync(DB_PATH, backupPath);
        }

        fs.copyFileSync(tmpPath, DB_PATH);
        fs.unlinkSync(tmpPath);

        const restoreClient = new Database(DB_PATH);
        const restoreDb = drizzle(restoreClient, { schema });
        migrate(restoreDb, { migrationsFolder: path.join(process.cwd(), "drizzle") });
        restoreClient.close();

        reload();

        return c.json({ message: "Database restored and migrated successfully" });
    } catch (err) {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, DB_PATH);
            fs.unlinkSync(backupPath);
            reload();
        }
        return c.json({ error: "Failed to restore database" }, 500);
    }
});
