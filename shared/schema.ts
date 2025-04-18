import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, json } from "drizzle-orm/pg-core";
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

// Badges schema
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(), // SVG icon or image path
  criteria: json("criteria").notNull(), // JSON with criteria like {type: "states_count", value: 10}
  tier: integer("tier").notNull().default(1), // 1=bronze, 2=silver, 3=gold, etc.
  category: text("category").notNull(), // E.g., "exploration", "regional", "special"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User badges junction table
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  metadata: json("metadata"), // Optional JSON with additional data about how badge was earned
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

// Badge insert schemas
export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  imageUrl: true,
  criteria: true,
  tier: true,
  category: true
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
  metadata: true
});

// Define badge criteria types for better type safety
export const badgeCriteriaSchema = z.union([
  // State count badges - based on number of states visited
  z.object({
    type: z.literal("stateCount"),
    count: z.number()
  }),
  
  // Region complete badges - based on completing a specific region
  z.object({
    type: z.literal("regionComplete"),
    region: z.string(),
    states: z.array(z.string())
  }),
  
  // Specific states badges - based on visiting specific states
  z.object({
    type: z.literal("specificStates"),
    states: z.array(z.string()),
    requireAll: z.boolean().optional(),
    requireAtLeastOne: z.boolean().optional(),
    andStates: z.array(z.string()).optional(),
    requireAtLeastOneFrom: z.boolean().optional()
  })
]);

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

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type BadgeCriteria = z.infer<typeof badgeCriteriaSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
