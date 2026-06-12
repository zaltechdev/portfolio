import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const owner = sqliteTable("owner", {
	id : text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	username : text("username").unique().notNull(),
	email : text("email").unique().notNull(),
	password : text("password").notNull(),
	createdAt : integer("created_at"),
	updatedAt : integer("updated_at"),
})

export const profiles = sqliteTable("profiles", {
	id : text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId : text("user_id").unique().notNull().references(() => owner.id, { onDelete : "cascade", onUpdate : "cascade" }),
	fullname : text("fullname").notNull(),
	description : text("description").notNull(),
	github : text("github").notNull(),
	email : text("email"),
	linkedin : text("linkedin"),
	photo : blob("photo", { mode : "buffer" }),
	createdAt : integer("created_at"),
	updatedAt : integer("updated_at"),
})

export const projects = sqliteTable("projects", {
	id : text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	profileId : text("profile_id").notNull().references(() => profiles.id, { onDelete : "cascade", onUpdate : "cascade" }).unique(),
	title : text("title").unique().notNull(),
	description : text("description").notNull(),
	techstack : text("techstack").notNull(),
	photo : blob("photo", { mode : "buffer" }),
	createdAt : integer("created_at"),
	updatedAt : integer("updated_at"),
})

export type payloadSessionStructure = {
	type? : string,
	data? : any
}

export const sessions = sqliteTable("sessions", {
	id : text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId : text("user_id").references(() => owner.id, { onDelete : "cascade", onUpdate : "cascade" }),	
	payloads : text("payloads", { mode : "json" }).$type<payloadSessionStructure>(),
	createdAt : integer("created_at"),
	expiredAt : integer("expired_at"),
})