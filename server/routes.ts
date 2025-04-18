import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertVisitedStateSchema, 
  insertActivitySchema, 
  insertSharedMapSchema,
  insertBadgeSchema, 
  insertUserBadgeSchema 
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  // Get all states
  app.get("/api/states", async (req, res) => {
    try {
      const states = await storage.getStates();
      res.json(states);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch states", error: (error as Error).message });
    }
  });

  // Get visited states for a user
  app.get("/api/visited-states/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`Fetching visited states for userId: ${userId}`);
      
      // Handle the case when userId is undefined
      if (!userId) {
        console.log("WARNING: userId is undefined or empty");
        return res.json([]);
      }
      
      const visitedStates = await storage.getVisitedStates(userId);
      console.log(`Found ${visitedStates.length} visited states for ${userId}`);
      
      // Log details of visited states for debugging
      if (visitedStates.length > 0) {
        console.log("First few visited states:");
        visitedStates.slice(0, 3).forEach(vs => {
          console.log(`  ${vs.stateId}: visited=${vs.visited}`);
        });
      }
      
      res.json(visitedStates);
    } catch (error) {
      console.error(`Error fetching visited states for ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch visited states", error: (error as Error).message });
    }
  });

  // Toggle state visited status
  app.post("/api/visited-states/toggle", async (req, res) => {
    try {
      const result = insertVisitedStateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data", error: result.error });
      }
      
      console.log("Toggle request body:", req.body);
      let { stateId, userId, visited, visitedAt } = result.data;
      
      // Ensure visited is a boolean
      if (typeof visited !== 'boolean') {
        console.log(`Warning: visited is not a boolean (${typeof visited}), converting to boolean`);
        visited = visited === 'true' || visited === true || visited === 1;
      }
      
      // Store the original userId before it gets normalized in the storage class
      const originalUserId = userId;
      
      // Toggle the state
      const visitedState = await storage.toggleStateVisited(stateId, userId, visited);
      
      // Add activity - ensure we use the same userId format as was used for the toggle
      const state = await storage.getStateById(stateId);
      if (state) {
        await storage.addActivity({
          userId: visitedState.userId, // Use the userId from the toggled state
          stateId,
          stateName: state.name,
          action: visited ? "visited" : "unvisited",
          timestamp: visitedAt || new Date().toISOString()
        });
      }
      
      console.log(`Successfully toggled state ${stateId} for ${userId} to ${visited}`);
      res.json(visitedState);
    } catch (error) {
      console.error("Error toggling state:", error);
      res.status(500).json({ message: "Failed to toggle state", error: (error as Error).message });
    }
  });

  // Reset all visited states for a user
  app.post("/api/visited-states/reset/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.resetVisitedStates(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset states", error: (error as Error).message });
    }
  });

  // Get activities for a user
  app.get("/api/activities/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities", error: (error as Error).message });
    }
  });

  // Add a new activity
  app.post("/api/activities", async (req, res) => {
    try {
      const result = insertActivitySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data", error: result.error });
      }
      
      const activity = await storage.addActivity(result.data);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to add activity", error: (error as Error).message });
    }
  });

  // Save a shared map
  app.post("/api/shared-maps", async (req, res) => {
    try {
      const { userId, imageData } = req.body;
      
      if (!userId || !imageData) {
        return res.status(400).json({ message: "userId and imageData are required" });
      }
      
      const sharedMap = await storage.saveSharedMap(userId, imageData);
      res.json({
        shareCode: sharedMap.shareCode,
        shareUrl: `${req.protocol}://${req.get('host')}/shared/${sharedMap.shareCode}`
      });
    } catch (error) {
      console.error("Error saving shared map:", error);
      res.status(500).json({ message: "Failed to save shared map", error: (error as Error).message });
    }
  });

  // Get a shared map by code
  app.get("/api/shared-maps/:shareCode", async (req, res) => {
    try {
      const { shareCode } = req.params;
      const sharedMap = await storage.getSharedMapByCode(shareCode);
      
      if (!sharedMap) {
        return res.status(404).json({ message: "Shared map not found" });
      }
      
      res.json({
        id: sharedMap.id,
        userId: sharedMap.userId,
        imageData: sharedMap.imageData,
        shareCode: sharedMap.shareCode,
        createdAt: sharedMap.createdAt
      });
    } catch (error) {
      console.error("Error retrieving shared map:", error);
      res.status(500).json({ message: "Failed to retrieve shared map", error: (error as Error).message });
    }
  });

  // Route to view a shared map
  app.get("/shared/:shareCode", (req, res) => {
    // Redirect to the frontend with the share code as a query parameter
    res.redirect(`/?share=${req.params.shareCode}`);
  });
  
  // BADGE ROUTES
  
  // Get all badges
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges", error: (error as Error).message });
    }
  });
  
  // Get badges by category
  app.get("/api/badges/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const badges = await storage.getBadgesByCategory(category);
      res.json(badges);
    } catch (error) {
      console.error(`Error fetching badges for category ${req.params.category}:`, error);
      res.status(500).json({ message: "Failed to fetch badges by category", error: (error as Error).message });
    }
  });
  
  // Get a specific badge
  app.get("/api/badges/:badgeId", async (req, res) => {
    try {
      const badgeId = parseInt(req.params.badgeId);
      if (isNaN(badgeId)) {
        return res.status(400).json({ message: "Invalid badge ID" });
      }
      
      const badge = await storage.getBadgeById(badgeId);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      
      res.json(badge);
    } catch (error) {
      console.error(`Error fetching badge ${req.params.badgeId}:`, error);
      res.status(500).json({ message: "Failed to fetch badge", error: (error as Error).message });
    }
  });
  
  // Get user badges
  app.get("/api/user-badges/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error(`Error fetching badges for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch user badges", error: (error as Error).message });
    }
  });
  
  // Check for new badges
  app.post("/api/check-badges/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const newBadges = await storage.checkForNewBadges(userId);
      
      if (newBadges.length > 0) {
        res.json({
          newBadgesEarned: true,
          badges: newBadges
        });
      } else {
        res.json({
          newBadgesEarned: false,
          badges: []
        });
      }
    } catch (error) {
      console.error(`Error checking badges for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to check for new badges", error: (error as Error).message });
    }
  });
  
  // Directly award a badge to a user (admin/testing functionality)
  app.post("/api/award-badge", async (req, res) => {
    try {
      const { userId, badgeId, metadata } = req.body;
      
      if (!userId || !badgeId) {
        return res.status(400).json({ message: "userId and badgeId are required" });
      }
      
      const userBadge = await storage.awardBadgeToUser(userId, parseInt(badgeId), metadata);
      res.json(userBadge);
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ message: "Failed to award badge", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
