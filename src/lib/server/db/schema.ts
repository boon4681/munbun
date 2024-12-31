import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { createId, init } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';

const short = init({
	length: 8
})

export const USER = sqliteTable('user', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	email: text('email').notNull(),
	role: text('role').notNull().default("superadmin"),
	last_login: text('last_login'),
	created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const PROJECT = sqliteTable('project', {
	id: text('id').primaryKey().$defaultFn(() => short()),
	name: text('name').notNull(),
	api_key: text('key').notNull().$defaultFn(() => [createId(), createId(), createId()].join(".")),
	description: text('description'),
	created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
})

export const TEMPLATE = sqliteTable('template', {
	project: text("project").notNull().references(() => PROJECT.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	name: text('name').notNull(),
	template: text('template'),
	variables: text('variables', { mode: "json" }).$type<{ id: string, name: string, value: string }[]>().notNull().default([]),
	description: text('description'),
	created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => {
	return {
		booking_approval_id: primaryKey({ columns: [table.name, table.project], name: "template_project_id" }),
	}
})

export const kvTable = sqliteTable("_kvs", {
	key: text("key").notNull().unique().primaryKey(),
	value: text("value").notNull()
});

export const logTable = sqliteTable("_logs", {
	status: text("key").notNull().unique().primaryKey(),
	message: text("value").notNull().unique(),
	created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
})

export const projectRelations = relations(PROJECT, ({ many, one }) => ({
	templates: many(TEMPLATE),
}));

export const templateRelations = relations(TEMPLATE, ({ one }) => ({
	project: one(PROJECT, {
		fields: [TEMPLATE.project],
		references: [PROJECT.id],
	}),
}));