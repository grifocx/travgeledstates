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
    const visitedStatesCount = userVisitedStates.filter(vs => vs.visited).length;
    const visitedStateIds = userVisitedStates
      .filter(vs => vs.visited)
      .map(vs => vs.stateId);
    
    console.log(`User ${normalizedUserId} has visited ${visitedStatesCount} states: ${visitedStateIds.join(', ')}`);
    
    // Get all badges user hasn't earned yet
    const userBadgesResult = await this.getUserBadges(normalizedUserId);
    const userBadgeIds = userBadgesResult.map(ub => ub.badge.id);
    
    const allBadges = await this.getAllBadges();
    
    // Debug: print raw criteria data from badges
    console.log("DEBUGGING BADGE CRITERIA:");
    allBadges.forEach(badge => {
      const criteriaStr = typeof badge.criteria === 'string' 
        ? badge.criteria 
        : JSON.stringify(badge.criteria);
      console.log(`Badge ${badge.id}: ${badge.name}, Criteria: ${criteriaStr}`);
    });
    
    const unearnedBadges = allBadges.filter(badge => !userBadgeIds.includes(badge.id));
    
    console.log(`User has ${userBadgeIds.length} badges already, checking ${unearnedBadges.length} unearned badges`);
    
    // Check each badge criteria
    const newlyEarnedBadges: Badge[] = [];
    
    for (const badge of unearnedBadges) {
      try {
        console.log(`Processing badge: ${badge.name} (${badge.id})`);
        console.log(`Raw criteria data: ${JSON.stringify(badge.criteria)}`);
        
        // Attempt to parse criteria if needed
        let criteria: any;
        try {
          criteria = typeof badge.criteria === 'string' 
            ? JSON.parse(badge.criteria) 
            : badge.criteria;
        } catch (parseError) {
          console.error(`Error parsing criteria for badge ${badge.name}:`, parseError);
          console.log(`Problematic criteria value:`, badge.criteria);
          continue; // Skip this badge
        }
        
        // Handle case where criteria might be double-stringified
        if (typeof criteria === 'string') {
          try {
            criteria = JSON.parse(criteria);
          } catch (e) {
            console.log(`Note: Criteria was string but not JSON: ${criteria}`);
          }
        }
        
        // Check if criteria has the expected type property
        if (!criteria || !criteria.type) {
          console.error(`Badge ${badge.name} has invalid criteria format:`, criteria);
          continue;
        }
        
        console.log(`Checking badge: ${badge.name}, criteria type: ${criteria.type}`);
        
        // Normalize criteria type to handle different formats (camelCase vs snake_case)
        const criteriaType = criteria.type.replace(/_/g, '').toLowerCase();
        console.log(`Normalized criteria type: ${criteriaType}`);
        
        if (criteriaType === 'statecount' || criteriaType === 'statescount') {
          // State count badge - check if user has visited enough states
          // Note: Database uses 'value' but our code uses 'count'
          const requiredCount = criteria.count || criteria.value;
          
          if (typeof requiredCount !== 'number') {
            console.error(`State count badge ${badge.name} has invalid count:`, requiredCount);
            continue;
          }
          
          console.log(`State count badge: ${badge.name}, required: ${requiredCount}, user has: ${visitedStatesCount}`);
          if (visitedStatesCount >= requiredCount) {
            console.log(`User earned "${badge.name}" badge (stateCount=${requiredCount})`);
            await this.awardBadgeToUser(normalizedUserId, badge.id, {
              statesCount: visitedStatesCount,
              earnedAt: new Date().toISOString()
            });
            newlyEarnedBadges.push(badge);
          }
        }
        else if (criteriaType === 'regioncomplete') {
          // Region complete badge - check if all states in region visited
          // Note: Database uses 'value' but our code uses 'states'
          let regionStates = criteria.states || criteria.value;
          
          if (!regionStates || !Array.isArray(regionStates)) {
            console.error(`Region badge ${badge.name} has invalid states list:`, regionStates);
            continue;
          }
          
          // Create a new array to avoid potential undefined issues
          regionStates = [...regionStates];
          
          const visitedRegionStates = visitedStateIds.filter(id => regionStates.includes(id));
          
          console.log(`Region badge: ${badge.name}, required: ${regionStates.length}, user has: ${visitedRegionStates.length}`);
          console.log(`Region states: ${regionStates.join(', ')}`);
          console.log(`Visited region states: ${visitedRegionStates.join(', ')}`);
          console.log(`User visited states: ${visitedStateIds.join(', ')}`);
          
          if (visitedRegionStates.length === regionStates.length) {
            console.log(`User earned "${badge.name}" badge (completed region)`);
            await this.awardBadgeToUser(normalizedUserId, badge.id, {
              regionStates: regionStates,
              earnedAt: new Date().toISOString()
            });
            newlyEarnedBadges.push(badge);
          }
        }
        else if (criteriaType === 'specificstates') {
          let badgeEarned = false;
          
          // Note: Database uses 'value' but our code uses 'states'
          let requiredStates = criteria.states || criteria.value;
          
          if (!requiredStates || !Array.isArray(requiredStates)) {
            console.error(`Specific states badge ${badge.name} has invalid states list:`, requiredStates);
            continue;
          }
          
          // Create a new array to avoid potential undefined issues
          requiredStates = [...requiredStates];
          
          // For simple specific states badges (just visit all in list)
          const allVisited = requiredStates.every(state => visitedStateIds.includes(state));
          console.log(`Specific states badge: ${badge.name}, required all: ${requiredStates.join(", ")}, all visited: ${allVisited}`);
          
          if (allVisited) {
            badgeEarned = true;
          }
          
          // These are for more complex badges with multiple state groups
          // That we don't currently have in the database
          if (!badgeEarned && criteria.requireAtLeastOne && criteria.andStates && criteria.requireAtLeastOneFrom) {
            // Must visit at least one from first group AND at least one from second group
            const hasFirstGroup = requiredStates.some(state => visitedStateIds.includes(state));
            const hasSecondGroup = criteria.andStates.some(state => visitedStateIds.includes(state));
            
            console.log(`Complex badge check: has first group (${requiredStates.join(", ")}): ${hasFirstGroup}, has second group (${criteria.andStates.join(", ")}): ${hasSecondGroup}`);
            
            if (hasFirstGroup && hasSecondGroup) {
              badgeEarned = true;
            }
          }
          
          if (badgeEarned) {
            console.log(`User earned "${badge.name}" badge (specific states criteria)`);
            await this.awardBadgeToUser(normalizedUserId, badge.id, {
              specificStates: requiredStates,
              earnedAt: new Date().toISOString()
            });
            newlyEarnedBadges.push(badge);
          }
        } else {
          console.log(`Unknown criteria type: ${criteria.type} for badge ${badge.name}`);
        }
      } catch (error) {
        console.error(`Error processing badge ${badge.name}:`, error);
      }
    }
    
    console.log(`User earned ${newlyEarnedBadges.length} new badges`);
    return newlyEarnedBadges;
  }
}

export const storage = new DatabaseStorage();
