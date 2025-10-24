import { pgTable, text, timestamp, boolean, uuid, jsonb, varchar, integer } from "drizzle-orm/pg-core";

export const aiTools = pgTable("ai_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  parameters: jsonb("parameters").notNull(), // JSON schema for parameters
  implementation: text("implementation").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const toolExecutions = pgTable("tool_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  toolId: uuid("tool_id").notNull().references(() => aiTools.id, { onDelete: "cascade" }),
  parameters: jsonb("parameters").notNull(),
  result: jsonb("result"),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'success', 'failed'
  errorMessage: text("error_message"),
  executionTime: integer("execution_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});