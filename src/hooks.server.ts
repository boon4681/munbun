import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { generateKeySync } from "node:crypto";
import { KVEndpoint } from "$constants";
import db, { KV } from "@/server/db";
import path from "node:path";

migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") })

await KV.init(KVEndpoint.setup, async () => {
    return "false"
})

await KV.init(KVEndpoint.resend_api_key, async () => {
    return ""
})

await KV.init(KVEndpoint.gmail_smtp_user, async () => {
    return ""
})

await KV.init(KVEndpoint.gmail_smtp_pass, async () => {
    return ""
})

await KV.init(KVEndpoint.jwt_secret, async () => {
    return generateKeySync("hmac", { length: 2048 }).export().toString("base64")
})
