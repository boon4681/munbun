import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { db } from "$server/db";
import { logTable } from "$server/db/schema";
import { countEmailSendsOn, getDailyEmailLimit } from "$server/email-limits";

export default new Hono().get("/email-stats", async (c) => {
    const dayExpr = sql<string>`substr(${logTable.created_at}, 1, 10)`;
    const monthExpr = sql<string>`substr(${logTable.created_at}, 1, 7)`;
    const isSuccessfulEmail = sql`${logTable.tag} = 'email' AND CAST(json_extract(${logTable.message}, '$.response.status') AS INTEGER) BETWEEN 200 AND 299`;

    const [totalsRow] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(logTable)
        .where(isSuccessfulEmail);

    const dailyRows = await db
        .select({ day: dayExpr, count: sql<number>`COUNT(*)` })
        .from(logTable)
        .where(isSuccessfulEmail)
        .groupBy(dayExpr)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(1);

    const monthlyRows = await db
        .select({ month: monthExpr, count: sql<number>`COUNT(*)` })
        .from(logTable)
        .where(isSuccessfulEmail)
        .groupBy(monthExpr)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(1);

    const [dailyLimit, todayCount] = await Promise.all([
        getDailyEmailLimit(),
        countEmailSendsOn(),
    ]);

    return c.json({
        data: {
            total: Number(totalsRow?.total ?? 0),
            maxDay: dailyRows[0] ? Number(dailyRows[0].count) : 0,
            maxDayDate: dailyRows[0]?.day ?? null,
            maxMonth: monthlyRows[0] ? Number(monthlyRows[0].count) : 0,
            maxMonthDate: monthlyRows[0]?.month ?? null,
            todayCount,
            dailyLimit,
            asOf: DateTime.utc().toISO(),
        },
    });
});
