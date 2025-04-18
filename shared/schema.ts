import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// State data schema
export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  stateId: text("state_id").notNull().unique(), // e.g., "NY", "CA"
  name: text("name").notNull(),   // e.g., "New York", "California"
});

// Visited states schema
export const visitedStates = pgTable("visited_states", {
  id: serial("id").primaryKey(),
  stateId: text("state_id").notNull(),
  userId: text("user_id").notNull(), // For now, this will be a session identifier
  visited: boolean("visited").notNull().default(true),
  visitedAt: text("visited_at").notNull(), // ISO date string
});

// Insert schemas
export const insertStateSchema = createInsertSchema(states).pick({
  stateId: true,
  name: true,
});

export const insertVisitedStateSchema = createInsertSchema(visitedStates).pick({
  stateId: true,
  userId: true,
  visited: true,
  visitedAt: true,
});

// Export types
export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;

export type VisitedState = typeof visitedStates.$inferSelect;
export type InsertVisitedState = z.infer<typeof insertVisitedStateSchema>;

// User activity schema for tracking recent actions
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  stateId: text("state_id").notNull(),
  stateName: text("state_name").notNull(),
  action: text("action").notNull(), // "visited" or "unvisited"
  timestamp: text("timestamp").notNull(), // ISO date string
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  stateId: true,
  stateName: true,
  action: true,
  timestamp: true,
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
