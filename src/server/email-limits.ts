import { sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { db, KV } from "$server/db";
import { logTable } from "$server/db/schema";
import { KVEndpoint } from "$constants";

const isSuccessfulEmail = sql`${logTable.tag} = 'email' AND CAST(json_extract(${logTable.message}, '$.response.status') AS INTEGER) BETWEEN 200 AND 299`;

export const countEmailSendsOn = async (day: string = DateTime.utc().toFormat("yyyy-MM-dd")): Promise<number> => {
    const dayExpr = sql<string>`substr(${logTable.created_at}, 1, 10)`;
    const [row] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(logTable)
        .where(sql`${isSuccessfulEmail} AND ${dayExpr} = ${day}`);
    return Number(row?.count ?? 0);
};

export const getDailyEmailLimit = async (): Promise<number> => {
    const raw = (await KV.get(KVEndpoint.daily_email_limit)) ?? "500";
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const checkDailyLimit = async (requested: number): Promise<{ used: number; limit: number; remaining: number } | null> => {
    const limit = await getDailyEmailLimit();
    if (limit <= 0) return null;
    const used = await countEmailSendsOn();
    const remaining = Math.max(0, limit - used);
    if (used + requested > limit) {
        return { used, limit, remaining };
    }
    return null;
};
