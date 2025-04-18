import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Activity, State, VisitedState } from "@shared/schema";
import { usaStatesData } from "@/lib/usaStatesData";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAuth } from "./use-auth";

export const useVisitedStates = () => {
  // Get user from auth context
  const { user } = useAuth();
  const [userId, setUserId] = useState<string>("");
  
  // Update userId whenever auth state changes
  useEffect(() => {
    if (user?.id) {
      setUserId(`user_${user.id}`);
      // Also save to localStorage for persistence
      localStorage.setItem("user_id", `user_${user.id}`);
      console.log(`Using authenticated user ID: user_${user.id}`);
    } else {
      // Use anonymous ID from localStorage if not authenticated
      let anonymousId = localStorage.getItem("user_id");
      if (!anonymousId) {
        anonymousId = `user_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("user_id", anonymousId);
      }
      setUserId(anonymousId);
      console.log(`Using anonymous user ID: ${anonymousId}`);
    }
  }, [user]);
  const queryClient = useQueryClient();
  
  // Define Zod schemas for type safety
  const StateSchema = z.array(z.object({
    id: z.number(),
    stateId: z.string(),
    name: z.string(),
  }));

  const VisitedStateSchema = z.array(z.object({
    id: z.number(),
    stateId: z.string(),
    userId: z.string(),
    visited: z.boolean(),
    visitedAt: z.string(),
    notes: z.string().nullable().optional(),
  }));

  const ActivitySchema = z.array(z.object({
    id: z.number(),
    userId: z.string(),
    stateId: z.string(),
    stateName: z.string(),
    action: z.string(),
    timestamp: z.string(),
  }));

  // Fetch states with type safety
  const { 
    data: states = [],
    isLoading: statesLoading,
    error: statesError
  } = useQuery<State[], Error, State[]>({
    queryKey: ["/api/states"],
    staleTime: Infinity, // States don't change
  });
  
  // Fetch visited states with type safety - only if we have a userId
  const visitedStatesQuery = useQuery<VisitedState[], Error, VisitedState[]>({
    queryKey: [`/api/visited-states/${userId}`],
    refetchOnWindowFocus: true,
    enabled: !!userId, // Only run query if userId is available
  });
  
  // Extract data, loading, and error states from the query
  const visitedStates = visitedStatesQuery.data || [];
  const visitedStatesLoading = visitedStatesQuery.isLoading;
  const visitedStatesError = visitedStatesQuery.error;
  
  // Add debugging to track when visitedStates change
  useEffect(() => {
    console.log(`useVisitedStates hook: Visited states updated, now has ${visitedStates.length} items`);
    if (visitedStates.length > 0) {
      console.log("Sample visited state:", visitedStates[0]);
    }
  }, [visitedStates]);
  
  // Fetch activities with type safety - only if we have a userId
  const { 
    data: activities = [],
    isLoading: activitiesLoading,
    error: activitiesError
  } = useQuery<Activity[], Error, Activity[]>({
    queryKey: [`/api/activities/${userId}`],
    refetchOnWindowFocus: true,
    enabled: !!userId, // Only run query if userId is available
  });
  
  // Toggle visited state mutation
  const toggleVisitedMutation = useMutation({
    mutationFn: async ({ stateId, visited }: { stateId: string, visited: boolean }) => {
      const visitedAt = new Date().toISOString();
      
      // First perform the optimistic update before the actual API call
      const optimisticVisitedState: VisitedState = {
        id: Math.floor(Math.random() * 1000000), // Temporary ID
        stateId,
        userId,
        visited,
        visitedAt,
        notes: null
      };
      
      // Apply optimistic update immediately
      const cachedData = queryClient.getQueryData<VisitedState[]>([`/api/visited-states/${userId}`]) || [];
      const existingIndex = cachedData.findIndex(vs => vs.stateId === stateId);
      
      // Create a new cache entry
      let newCacheData: VisitedState[];
      if (existingIndex >= 0) {
        newCacheData = [...cachedData];
        newCacheData[existingIndex] = optimisticVisitedState;
      } else {
        newCacheData = [...cachedData, optimisticVisitedState];
      }
      
      // Apply the optimistic update
      queryClient.setQueryData([`/api/visited-states/${userId}`], newCacheData);
      console.log("Applied optimistic update:", newCacheData);
      
      // Then make the actual API call
      const response = await apiRequest("POST", "/api/visited-states/toggle", {
        stateId,
        userId,
        visited,
        visitedAt
      });
      return response.json();
    },
    onSuccess: (newVisitedState) => {
      // The API call was successful, we can invalidate queries now
      queryClient.invalidateQueries({ queryKey: [`/api/visited-states/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${userId}`] });
      
      // Show a toast notification
      toast({
        title: newVisitedState.visited ? "State marked as visited" : "State marked as unvisited",
        description: `${states.find(s => s.stateId === newVisitedState.stateId)?.name || newVisitedState.stateId} has been updated.`,
      });
    },
    onError: (error) => {
      // Revert the optimistic update on error
      queryClient.invalidateQueries({ queryKey: [`/api/visited-states/${userId}`] });
      
      toast({
        title: "Error",
        description: `Failed to update state: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Reset all states mutation
  const resetAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/visited-states/reset/${userId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/visited-states/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${userId}`] });
      toast({
        title: "Reset Complete",
        description: "All states have been reset to unvisited",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reset states: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Calculate statistics
  const stats = useMemo(() => {
    const visitedCount = visitedStates.filter((vs: VisitedState) => vs.visited).length;
    const totalStates = states.length || 50; // Fallback to 50 if API hasn't loaded yet
    const percentage = Math.round((visitedCount / totalStates) * 100) || 0;
    
    return {
      visited: visitedCount,
      total: totalStates,
      percentage,
    };
  }, [states, visitedStates]);
  
  // Handle errors (fallback to local data if API fails)
  useEffect(() => {
    if (statesError) {
      console.error("Failed to load states:", statesError);
      toast({
        title: "Warning",
        description: "Using local state data due to connection issues",
        variant: "destructive",
      });
    }
    
    if (visitedStatesError) {
      console.error("Failed to load visited states:", visitedStatesError);
      toast({
        title: "Error",
        description: "Failed to load your visited states",
        variant: "destructive",
      });
    }
    
    if (activitiesError) {
      console.error("Failed to load activities:", activitiesError);
    }
  }, [statesError, visitedStatesError, activitiesError]);
  
  // Function to toggle state visited status
  const toggleStateVisited = (stateId: string, visited: boolean) => {
    console.log(`Toggling state ${stateId} to ${visited ? 'visited' : 'unvisited'}`);
    toggleVisitedMutation.mutate({ stateId, visited });
  };
  
  // Function to reset all states
  const resetAllStates = () => {
    if (window.confirm("Are you sure you want to reset all states to unvisited?")) {
      resetAllMutation.mutate();
    }
  };
  
  // Loading state for component consumers
  const loading = statesLoading || visitedStatesLoading || activitiesLoading;
  
  return {
    states: states.length ? states : usaStatesData,
    visitedStates,
    activities,
    toggleStateVisited,
    resetAllStates,
    loading,
    stats,
  };
};
