import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Parse a SQLite timestamp string (with or without "T") as UTC.
 * Handles both "YYYY-MM-DD HH:MM:SS" and "YYYY-MM-DDTHH:MM:SS".
 */
export function parseSqliteDate(value: string): DateTime {
	const normalized = value.includes("T") ? value : value.replace(" ", "T") + "Z";
	return DateTime.fromISO(normalized, { zone: "utc" });
}

/**
 * Convert a DateTime to SQLite-compatible format "YYYY-MM-DD HH:MM:SS".
 */
export function toSqliteDate(d: DateTime): string {
	return d.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
}

/**
 * Format a SQLite timestamp string for display.
 * @param value - SQLite timestamp string
 * @param format - luxon format string (default: "MMM dd, yyyy h:mm a")
 */
export function formatDate(value: string, format = "yyyy-MM-dd HH:mm:ss"): string {
	return parseSqliteDate(value).toLocal().toFormat(format);
}

/**
 * Format a SQLite timestamp as a relative time string (e.g. "2 hours ago").
 */
export function formatRelative(value: string): string {
	return parseSqliteDate(value).toLocal().toRelative() ?? value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
