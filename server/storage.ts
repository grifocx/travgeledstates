import { 
  State, InsertState, 
  VisitedState, InsertVisitedState,
  Activity, InsertActivity,
  SharedMap, InsertSharedMap,
  states, visitedStates, activities, sharedMaps
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
  
  // Shared maps methods
  saveSharedMap(userId: string, imageData: string): Promise<SharedMap>;
  getSharedMapByCode(shareCode: string): Promise<SharedMap | undefined>;
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
    // Normalize userId to handle various formats (same logic as in toggleStateVisited)
    let normalizedUserId = userId;
    if (!userId) {
      console.log("Warning: getVisitedStates called with empty userId");
      return []; // Return empty array for empty userId
    }
    
    if (!normalizedUserId.startsWith('user_') && !isNaN(Number(normalizedUserId))) {
      normalizedUserId = `user_${normalizedUserId}`;
      console.log(`Normalized userId from ${userId} to ${normalizedUserId} in getVisitedStates`);
    }
    
    console.log(`Getting visited states for normalized userId: ${normalizedUserId}`);
    const results = await db.select().from(visitedStates).where(eq(visitedStates.userId, normalizedUserId));
    console.log(`Found ${results.length} visited states`);
    return results;
  }

  // Toggle state visited status
  async toggleStateVisited(stateId: string, userId: string, visited: boolean): Promise<VisitedState> {
    console.log(`Storage: Toggling state ${stateId} for user ${userId} to ${visited}`);
    
    // Normalize userId to handle various formats
    let normalizedUserId = userId;
    if (!normalizedUserId.startsWith('user_') && !isNaN(Number(normalizedUserId))) {
      normalizedUserId = `user_${normalizedUserId}`;
      console.log(`Normalized userId from ${userId} to ${normalizedUserId}`);
    }
    
    // Check if the record already exists
    const existing = await db.select()
      .from(visitedStates)
      .where(
        and(
          eq(visitedStates.stateId, stateId),
          eq(visitedStates.userId, normalizedUserId)
        )
      );
    
    console.log(`Found ${existing.length} existing records for ${stateId} and ${normalizedUserId}`);
    
    const timestamp = new Date().toISOString();
    
    if (existing.length > 0) {
      // Update existing record
      console.log(`Updating existing record for ${stateId}`);
      const [updated] = await db.update(visitedStates)
        .set({ 
          visited, 
          visitedAt: timestamp 
        })
        .where(
          and(
            eq(visitedStates.stateId, stateId),
            eq(visitedStates.userId, normalizedUserId)
          )
        )
        .returning();
      
      return updated;
    } else {
      // Insert new record
      console.log(`Inserting new record for ${stateId} and user ${normalizedUserId}`);
      const [newVisit] = await db.insert(visitedStates)
        .values({
          stateId,
          userId: normalizedUserId, // Use normalized ID
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
    // Normalize userId to handle various formats (same logic as in other methods)
    let normalizedUserId = userId;
    if (!userId) {
      console.log("Warning: getActivities called with empty userId");
      return []; // Return empty array for empty userId
    }
    
    if (!normalizedUserId.startsWith('user_') && !isNaN(Number(normalizedUserId))) {
      normalizedUserId = `user_${normalizedUserId}`;
      console.log(`Normalized userId from ${userId} to ${normalizedUserId} in getActivities`);
    }
    
    const results = await db.select()
      .from(activities)
      .where(eq(activities.userId, normalizedUserId))
      .orderBy(desc(activities.timestamp))
      .limit(limit);
      
    console.log(`Found ${results.length} activities for user ${normalizedUserId}`);
    return results;
  }

  // Add a new activity
  async addActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities)
      .values(activity)
      .returning();
    
    return newActivity;
  }

  // Save a shared map and generate a unique share code
  async saveSharedMap(userId: string, imageData: string): Promise<SharedMap> {
    // Normalize userId to handle various formats (same logic as in other methods)
    let normalizedUserId = userId;
    if (!normalizedUserId.startsWith('user_') && !isNaN(Number(normalizedUserId))) {
      normalizedUserId = `user_${normalizedUserId}`;
    }
    
    // Generate a random share code
    const shareCode = this.generateShareCode();
    
    // Save to database
    const [sharedMap] = await db.insert(sharedMaps)
      .values({
        userId: normalizedUserId,
        imageData,
        shareCode
      })
      .returning();
    
    return sharedMap;
  }

  // Get a shared map by its share code
  async getSharedMapByCode(shareCode: string): Promise<SharedMap | undefined> {
    const results = await db.select()
      .from(sharedMaps)
      .where(eq(sharedMaps.shareCode, shareCode));
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  // Helper method to generate a unique share code
  private generateShareCode(): string {
    // Generate a random string of characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 8;
    let result = '';
    
    for (let i = 0; i < codeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();
