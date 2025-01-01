import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "$server/db/schema"
import { eq } from 'drizzle-orm';
import fs from 'node:fs';
import type { KVEndpoint } from '../constants';
if(!fs.existsSync("_munbun_")) fs.mkdirSync("_munbun_")
const client = new Database("_munbun_/data.db");
const db = drizzle(client, { schema })
export default db;

type kvEndpoint = typeof KVEndpoint[keyof typeof KVEndpoint]

export class KV {
    static async has(k: kvEndpoint): Promise<boolean> {
        const m = await db.select().from(schema.kvTable).where(eq(schema.kvTable.key, k))
        return m.length ? true : false
    }
    static async set(k: kvEndpoint, v: string): Promise<void> {
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
    static async init(k: kvEndpoint, v: () => Promise<string>) {
        if (!await KV.has(k)) {
            const value = await v()
            await KV.set(k, value)
        }
    }
    static async get(k: kvEndpoint): Promise<string | undefined> {
        return (await db.select().from(schema.kvTable).where(eq(schema.kvTable.key, k)))[0].value
    }
}