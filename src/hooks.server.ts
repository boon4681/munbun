import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { generateKeySync } from "node:crypto";
import { KVEndpoint } from "$constants";
import db, { KV } from "@/server/db";

// migrate(db, {
//     migrationsFolder: './drizzle/'
// })

await KV.init(KVEndpoint.setup, async () => {
    return "false"
})

await KV.init(KVEndpoint.jwt_secret, async () => {
    return generateKeySync("hmac", { length: 2048 }).export().toString("base64")
})
