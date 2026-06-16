import { Hono } from "hono";
import { and, gte, lte } from "drizzle-orm";
import { DateTime } from "luxon";
import { db } from "$server/db";
import { logTable } from "$server/db/schema";

/**
 * Returns request counts grouped into buckets for the requested number of days.
 *
 * Query params:
 *   - days: number of trailing days to include (default 1)
 *   - steps: number of buckets to produce (default 24, i.e. hourly for 1d)
 */
export default new Hono().get("/", async (c) => {
    const days = Math.min(30, Math.max(1, Number(c.req.query("days") || "1")));
    const steps = Math.max(1, Number(c.req.query("steps") || "24"));

    const now = DateTime.utc();
    const start = now.minus({ days });

    const startStr = toSqliteDate(start);
    const endStr = toSqliteDate(now);

    const rows = await db.query.logTable.findMany({
        where: and(
            gte(logTable.created_at, startStr),
            lte(logTable.created_at, endStr),
        ),
        columns: {
            tag: true,
            status: true,
            message: true,
            created_at: true,
        },
    });

    const bucketMs = (days * 24 * 60 * 60 * 1000) / steps;
    const buckets = new Map<number, { total: number; errors: number; avgMsSum: number; avgMsCount: number }>();

    for (const row of rows) {
        const time = parseSqliteDate(row.created_at).toMillis();
        if (!Number.isFinite(time)) continue;

        const key = Math.floor(time / bucketMs) * bucketMs;
        const bucket = buckets.get(key) ?? {
            total: 0,
            errors: 0,
            avgMsSum: 0,
            avgMsCount: 0,
        };

        bucket.total += 1;

        const status = Number(row.status);
        if (row.tag === "error" || status >= 500) {
            bucket.errors += 1;
        }

        const parsed = parseMessage(row.message);
        const ms = parseDuration(parsed.response?.time);
        if (ms != null) {
            bucket.avgMsSum += ms;
            bucket.avgMsCount += 1;
        }

        buckets.set(key, bucket);
    }

    const startMs = start.toMillis();
    const endMs = now.toMillis();
    const firstBucket = Math.floor(startMs / bucketMs) * bucketMs;

    const sorted: { date: string; total: number; errors: number; avgMs: number | null }[] = [];
    for (let t = firstBucket; t <= endMs; t += bucketMs) {
        const bucket = buckets.get(t);
        sorted.push({
            date: DateTime.fromMillis(t, { zone: "utc" }).toISO()!,
            total: bucket?.total ?? 0,
            errors: bucket?.errors ?? 0,
            avgMs: bucket?.avgMsCount ? bucket.avgMsSum / bucket.avgMsCount : null,
        });
    }

    return c.json({ data: sorted });
});

function parseSqliteDate(value: string): DateTime {
    const normalized = value.includes("T") ? value : value.replace(" ", "T") + "Z";
    return DateTime.fromISO(normalized, { zone: "utc" });
}

function parseMessage(message: string) {
    try {
        return JSON.parse(message) as { response?: { status?: number; time?: string } };
    } catch {
        return {};
    }
}

function parseDuration(value: string | undefined) {
    if (!value) return null;
    const normalized = value.replace(/,/g, "").trim();
    if (normalized.endsWith("ms")) return Number.parseFloat(normalized);
    if (normalized.endsWith("s")) return Number.parseFloat(normalized) * 1000;
    return null;
}

function toSqliteDate(d: DateTime): string {
    return d.toFormat("yyyy-MM-dd HH:mm:ss");
}
