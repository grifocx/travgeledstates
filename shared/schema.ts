import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Will store hashed password
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => {
  return {
    usernameIdx: uniqueIndex("username_idx").on(table.username),
    emailIdx: uniqueIndex("email_idx").on(table.email)
  };
});

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
  userId: text("user_id").notNull(), // References user.id
  visited: boolean("visited").notNull().default(true),
  visitedAt: text("visited_at").notNull(), // Keeping as text to avoid migration issues
  notes: text("notes") // Optional notes about the visit
});

// User activity schema for tracking recent actions
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  stateId: text("state_id").notNull(),
  stateName: text("state_name").notNull(),
  action: text("action").notNull(), // "visited" or "unvisited"
  timestamp: text("timestamp").notNull() // Keeping as text to avoid migration issues
});

// Shared maps schema for storing and sharing map images
export const sharedMaps = pgTable("shared_maps", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  imageData: text("image_data").notNull(), // Base64 encoded image data
  shareCode: text("share_code").notNull().unique(), // Unique code for sharing
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    fullName: true
  })
  .extend({
    confirmPassword: z.string()
  });

export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6)
});

export const insertStateSchema = createInsertSchema(states).pick({
  stateId: true,
  name: true,
});

export const insertVisitedStateSchema = createInsertSchema(visitedStates).pick({
  stateId: true,
  userId: true,
  visited: true,
  visitedAt: true,
  notes: true
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  stateId: true,
  stateName: true,
  action: true,
  timestamp: true
});

export const insertSharedMapSchema = createInsertSchema(sharedMaps).pick({
  userId: true,
  imageData: true,
  shareCode: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;

export type VisitedState = typeof visitedStates.$inferSelect;
export type InsertVisitedState = z.infer<typeof insertVisitedStateSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type SharedMap = typeof sharedMaps.$inferSelect;
export type InsertSharedMap = z.infer<typeof insertSharedMapSchema>;
