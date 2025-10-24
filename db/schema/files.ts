import { pgTable, text, timestamp, boolean, uuid, varchar, integer } from "drizzle-orm/pg-core";

export const projectFiles = pgTable("project_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  path: text("path").notNull(),
  content: text("content"),
  size: integer("size").default(0).notNull(),
  isDirectory: boolean("is_directory").default(false).notNull(),
  language: varchar("language", { length: 50 }), // For syntax highlighting
  lastModified: timestamp("last_modified").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fileWatchers = pgTable("file_watchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  path: text("path").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});