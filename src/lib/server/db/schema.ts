import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';

export const USER = sqliteTable('user', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	email: text('email').notNull(),
	role: text('role').notNull().default("superadmin"),
	last_login: text('last_login'),
	created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const PROJECT = sqliteTable('project', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	api_key: text('key').notNull().$defaultFn(() => [createId(), createId(), createId()].join(".")),
	template: text(''),
	created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
})

export const kvTable = sqliteTable("_kvs", {
	key: text("key").notNull().unique().primaryKey(),
	value: text("value").notNull().unique()
});
