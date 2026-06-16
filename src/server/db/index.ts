import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "./schema"
import { eq } from 'drizzle-orm';
import fs from 'node:fs';
import type { KVEndpoint } from '../constants';

const DB_PATH = "_munbun_/data.db";

if (!fs.existsSync("_munbun_")) fs.mkdirSync("_munbun_")

let client = new Database(DB_PATH);
let db = drizzle(client, { schema })

export function reload() {
    client.close();
    client = new Database(DB_PATH);
    db = drizzle(client, { schema });
}

export { db, DB_PATH };

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