import { pgTable, text, timestamp, boolean, uuid, jsonb, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  framework: varchar("framework", { length: 50 }).notNull(),
  containerId: text("container_id").unique(),
  devServerUrl: text("dev_server_url"),
  language: varchar("language", { length: 10 }).default("ar").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastAccessed: timestamp("last_accessed").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  userId: text("user_id"),
});

export const versions = pgTable("versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  snapshotData: jsonb("snapshot_data").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  context: jsonb("context"), // Additional context like current file, selected code
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deployments = pgTable("deployments", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(), // 'netlify', 'vercel', 'github'
  deploymentUrl: text("deployment_url"),
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'success', 'failed'
  deploymentId: text("deployment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});