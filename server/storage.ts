import { 
  State, InsertState, 
  VisitedState, InsertVisitedState,
  Activity, InsertActivity,
  SharedMap, InsertSharedMap,
  Badge, InsertBadge,
  UserBadge, InsertUserBadge,
  BadgeCriteria,
  states, visitedStates, activities, sharedMaps, badges, userBadges
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

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
  
  // Badge methods
  getAllBadges(): Promise<Badge[]>;
  getBadgeById(badgeId: number): Promise<Badge | undefined>;
  getBadgesByCategory(category: string): Promise<Badge[]>;
  
  // User badge methods
  getUserBadges(userId: string): Promise<{badge: Badge, userBadge: UserBadge}[]>;
  awardBadgeToUser(userId: string, badgeId: number, metadata?: any): Promise<UserBadge>;
  checkForNewBadges(userId: string): Promise<Badge[]>;
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

  // BADGE METHODS
  
  // Get all badges
  async getAllBadges(): Promise<Badge[]> {
    return db.select().from(badges).orderBy(badges.tier, badges.name);
  }
  
  // Get a badge by ID
  async getBadgeById(badgeId: number): Promise<Badge | undefined> {
    const results = await db.select().from(badges).where(eq(badges.id, badgeId));
    return results.length > 0 ? results[0] : undefined;
  }
  
  // Get badges by category
  async getBadgesByCategory(category: string): Promise<Badge[]> {
    return db.select().from(badges).where(eq(badges.category, category)).orderBy(badges.tier, badges.name);
  }
  
  // Get badges for a user with badge details
  async getUserBadges(userId: string): Promise<{badge: Badge, userBadge: UserBadge}[]> {
    // Normalize userId
    let normalizedUserId = userId;
    if (!normalizedUserId.startsWith('user_') && !isNaN(Number(normalizedUserId))) {
      normalizedUserId = `user_${normalizedUserId}`;
    }
    
    const result = await db.select({
      badge: badges,
      userBadge: userBadges
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, normalizedUserId))
    .orderBy(desc(userBadges.earnedAt));
    
    return result;
  }
  
  // Award a badge to a user
  async awardBadgeToUser(userId: string, badgeId: number, metadata?: any): Promise<UserBadge> {
    // Normalize userId
    let normalizedUserId = userId;
    if (!normalizedUserId.startsWith('user_') && !isNaN(Number(normalizedUserId))) {
      normalizedUserId = `user_${normalizedUserId}`;
    }
    
    // Check if user already has this badge
    const existingBadges = await db.select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, normalizedUserId),
          eq(userBadges.badgeId, badgeId)
        )
      );
    
    if (existingBadges.length > 0) {
      // User already has this badge, return existing
      return existingBadges[0];
    }
    
    // Award new badge
    const [newUserBadge] = await db.insert(userBadges)
      .values({
        userId: normalizedUserId,
        badgeId,
        metadata: metadata || undefined
      })
      .returning();
    
    // Add an activity for earning the badge
    const badge = await this.getBadgeById(badgeId);
    if (badge) {
      await this.addActivity({
        userId: normalizedUserId,
        stateId: 'badge', // Special activity type
        stateName: badge.name,
        action: 'earned_badge',
        timestamp: new Date().toISOString()
      });
    }
    
    return newUserBadge;
  }
  
  // Check for new badges a user might have earned
  async checkForNewBadges(userId: string): Promise<Badge[]> {
    // Normalize userId
    let normalizedUserId = userId;
    if (!normalizedUserId.startsWith('user_') && !isNaN(Number(normalizedUserId))) {
      normalizedUserId = `user_${normalizedUserId}`;
    }
    
    // Get user's visited states
    const userVisitedStates = await this.getVisitedStates(normalizedUserId);
    const visitedStatesCount = userVisitedStates.filter(state => state.visited).length;
    const visitedStateIds = userVisitedStates
      .filter(state => state.visited)
      .map(state => state.stateId);
    
    console.log(`User ${normalizedUserId} has visited ${visitedStatesCount} states: ${visitedStateIds.join(', ')}`);
    
    // Get all badges user hasn't earned yet
    const userBadges = await this.getUserBadges(normalizedUserId);
    const userBadgeIds = userBadges.map(ub => ub.badge.id);
    
    const allBadges = await this.getAllBadges();
    const unearnedBadges = allBadges.filter(badge => !userBadgeIds.includes(badge.id));
    
    console.log(`User has ${userBadgeIds.length} badges already, checking ${unearnedBadges.length} unearned badges`);
    
    // Check each badge criteria
    const newlyEarnedBadges: Badge[] = [];
    
    for (const badge of unearnedBadges) {
      const criteria = badge.criteria as BadgeCriteria;
      
      if (criteria.type === 'stateCount') {
        // State count badge - check if user has visited enough states
        if (visitedStatesCount >= criteria.count) {
          console.log(`User earned "${badge.name}" badge (stateCount=${criteria.count})`);
          await this.awardBadgeToUser(normalizedUserId, badge.id, {
            statesCount: visitedStatesCount,
            earnedAt: new Date().toISOString()
          });
          newlyEarnedBadges.push(badge);
        }
      }
      else if (criteria.type === 'regionComplete') {
        // Region complete badge - check if all states in region visited
        const regionStates = criteria.states;
        const visitedRegionStates = visitedStateIds.filter(id => regionStates.includes(id));
        
        if (visitedRegionStates.length === regionStates.length) {
          console.log(`User earned "${badge.name}" badge (completed region ${criteria.region})`);
          await this.awardBadgeToUser(normalizedUserId, badge.id, {
            region: criteria.region,
            regionStates: regionStates,
            earnedAt: new Date().toISOString()
          });
          newlyEarnedBadges.push(badge);
        }
      }
      else if (criteria.type === 'specificStates') {
        let badgeEarned = false;
        
        // Specific states badge - check specific combinations
        if (criteria.requireAll) {
          // All states must be visited
          const allVisited = criteria.states.every(state => visitedStateIds.includes(state));
          if (allVisited) {
            badgeEarned = true;
          }
        } 
        else if (criteria.requireAtLeastOne && criteria.andStates && criteria.requireAtLeastOneFrom) {
          // Must visit at least one from first group AND at least one from second group
          const hasFirstGroup = criteria.states.some(state => visitedStateIds.includes(state));
          const hasSecondGroup = criteria.andStates.some(state => visitedStateIds.includes(state));
          
          if (hasFirstGroup && hasSecondGroup) {
            badgeEarned = true;
          }
        }
        
        if (badgeEarned) {
          console.log(`User earned "${badge.name}" badge (specific states criteria)`);
          await this.awardBadgeToUser(normalizedUserId, badge.id, {
            specificStates: criteria.states,
            earnedAt: new Date().toISOString()
          });
          newlyEarnedBadges.push(badge);
        }
      }
    }
    
    console.log(`User earned ${newlyEarnedBadges.length} new badges`);
    return newlyEarnedBadges;
  }
}

export const storage = new DatabaseStorage();
