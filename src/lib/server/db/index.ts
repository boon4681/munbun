import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import * as schema from "$server/db/schema"
import { eq } from 'drizzle-orm';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = new Database(env.DATABASE_URL);
const db = drizzle(client, { schema })
export default db;

export class KV {
    static async has(k: string): Promise<boolean> {
        const m = await db.select().from(schema.kvTable).where(eq(schema.kvTable.key, k))
        return m.length ? true : false
    }
    static async set(k: string, v: string): Promise<void> {
        if (await KV.has(k)) {
            await db.update(schema.kvTable).set({
                value: v
            }).where(eq(schema.kvTable.key, k))
        } else {
            await db.insert(schema.kvTable).values({
                key: k,
                value: v
            })
        }
    }
    static async init(k: string, v: () => Promise<string>) {
        if (!await KV.has(k)) {
            const value = await v()
            await KV.set(k, value)
        }
    }
    static async get(k: string): Promise<string | undefined> {
        return (await db.select().from(schema.kvTable).where(eq(schema.kvTable.key, k)))[0].value
    }
}