import { 
  State, InsertState, 
  VisitedState, InsertVisitedState,
  Activity, InsertActivity,
  states, visitedStates, activities
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // State methods
  getStates(): Promise<State[]>;
  getStateById(stateId: string): Promise<State | undefined>;
  
  // Visited states methods
  getVisitedStates(userId: string): Promise<VisitedState[]>;
  toggleStateVisited(stateId: string, userId: string, visited: boolean): Promise<VisitedState>;
  resetVisitedStates(userId: string): Promise<void>;
  
  // Activity methods
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  addActivity(activity: InsertActivity): Promise<Activity>;
}

export class DatabaseStorage implements IStorage {
  // Get all states
  async getStates(): Promise<State[]> {
    return db.select().from(states).orderBy(states.name);
  }

  // Get state by ID
  async getStateById(stateId: string): Promise<State | undefined> {
    const result = await db.select().from(states).where(eq(states.stateId, stateId));
    return result.length > 0 ? result[0] : undefined;
  }

  // Get visited states for a user
  async getVisitedStates(userId: string): Promise<VisitedState[]> {
    return db.select().from(visitedStates).where(eq(visitedStates.userId, userId));
  }

  // Toggle state visited status
  async toggleStateVisited(stateId: string, userId: string, visited: boolean): Promise<VisitedState> {
    // Check if the record already exists
    const existing = await db.select()
      .from(visitedStates)
      .where(
        and(
          eq(visitedStates.stateId, stateId),
          eq(visitedStates.userId, userId)
        )
      );
    
    const timestamp = new Date().toISOString();
    
    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db.update(visitedStates)
        .set({ 
          visited, 
          visitedAt: timestamp 
        })
        .where(
          and(
            eq(visitedStates.stateId, stateId),
            eq(visitedStates.userId, userId)
          )
        )
        .returning();
      
      return updated;
    } else {
      // Insert new record
      const [newVisit] = await db.insert(visitedStates)
        .values({
          stateId,
          userId,
          visited,
          visitedAt: timestamp
        })
        .returning();
      
      return newVisit;
    }
  }

  // Reset all visited states for a user
  async resetVisitedStates(userId: string): Promise<void> {
    await db.delete(visitedStates)
      .where(eq(visitedStates.userId, userId));
  }

  // Get activities for a user
  async getActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    return db.select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }

  // Add a new activity
  async addActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities)
      .values(activity)
      .returning();
    
    return newActivity;
  }
}

export const storage = new DatabaseStorage();
