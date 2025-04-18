import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVisitedStateSchema, insertActivitySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const visitedStates = await storage.getVisitedStates(userId);
      res.json(visitedStates);
    } catch (error) {
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
      
      const { stateId, userId, visited, visitedAt } = result.data;
      
      const visitedState = await storage.toggleStateVisited(stateId, userId, visited);
      
      // Add activity
      const state = await storage.getStateById(stateId);
      if (state) {
        await storage.addActivity({
          userId,
          stateId,
          stateName: state.name,
          action: visited ? "visited" : "unvisited",
          timestamp: visitedAt
        });
      }
      
      res.json(visitedState);
    } catch (error) {
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

  const httpServer = createServer(app);

  return httpServer;
}
