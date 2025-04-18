import { useState, useEffect, useMemo, useCallback } from "react";
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
  
  // Direct local state management for visited states
  const [localVisitedStates, setLocalVisitedStates] = useState<Map<string, boolean>>(new Map());
  
  // Initialize local state whenever visitedStates from API changes
  useEffect(() => {
    if (visitedStates.length > 0) {
      const newMap = new Map<string, boolean>();
      visitedStates.forEach(vs => {
        newMap.set(vs.stateId, vs.visited);
      });
      setLocalVisitedStates(newMap);
      console.log(`Updated local visited states map with ${newMap.size} entries from API`);
    }
  }, [visitedStates]);
  
  // Toggle visited state mutation with enhanced error handling
  const toggleVisitedMutation = useMutation({
    mutationFn: async ({ stateId, visited }: { stateId: string, visited: boolean }) => {
      const visitedAt = new Date().toISOString();
      
      // Update local state immediately for quick UI feedback
      setLocalVisitedStates(prev => {
        const newMap = new Map(prev);
        newMap.set(stateId, visited);
        
        console.log(`Local state updated: ${stateId} is now ${visited ? 'VISITED' : 'NOT VISITED'}`);
        console.log(`Local map now has ${newMap.size} entries`);
        
        // Force component update with our local state
        const forceUpdate = queryClient.getQueryData<number>(['forceUpdate']) || 0;
        queryClient.setQueryData(['forceUpdate'], forceUpdate + 1);
        
        return newMap;
      });
      
      // Then perform optimistic update in React Query cache
      const optimisticVisitedState: VisitedState = {
        id: Math.floor(Math.random() * 1000000), // Temporary ID
        stateId,
        userId,
        visited,
        visitedAt,
        notes: null
      };
      
      // Apply optimistic update immediately to the React Query cache
      const cachedData = queryClient.getQueryData<VisitedState[]>([`/api/visited-states/${userId}`]) || [];
      const existingIndex = cachedData.findIndex(vs => vs.stateId === stateId);
      
      // Create a new cache entry
      let newCacheData: VisitedState[];
      if (existingIndex >= 0) {
        newCacheData = [...cachedData];
        newCacheData[existingIndex] = { ...newCacheData[existingIndex], visited };
      } else {
        newCacheData = [...cachedData, optimisticVisitedState];
      }
      
      // Apply the optimistic update to React Query cache
      queryClient.setQueryData([`/api/visited-states/${userId}`], newCacheData);
      console.log(`Applied optimistic update to cache: ${stateId} set to ${visited ? 'visited' : 'not visited'}`);
      
      // Make the actual API call
      try {
        const response = await apiRequest("POST", "/api/visited-states/toggle", {
          stateId,
          userId,
          visited,
          visitedAt
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    onSuccess: (newVisitedState) => {
      // The API call was successful, refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/visited-states/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${userId}`] });
      
      // Show a toast notification
      const stateName = states.find(s => s.stateId === newVisitedState.stateId)?.name || newVisitedState.stateId;
      toast({
        title: newVisitedState.visited ? "State marked as visited" : "State marked as unvisited",
        description: `${stateName} has been updated.`,
      });
      
      console.log(`Successfully updated ${newVisitedState.stateId} to ${newVisitedState.visited ? 'visited' : 'not visited'}`);
    },
    onError: (error) => {
      // Log the error
      console.error("Error toggling state:", error);
      
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
  
  // Function to toggle state visited status with immediate local update
  const toggleStateVisited = useCallback((stateId: string, visited: boolean) => {
    if (!stateId) {
      console.error("Error: attempted to toggle a state with undefined stateId");
      toast({
        title: "Error",
        description: "Could not update state: missing state information",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Toggling state ${stateId} to ${visited ? 'visited' : 'unvisited'}`);
    
    // Immediately update local state for instant UI feedback
    setLocalVisitedStates(prev => {
      const newMap = new Map(prev);
      newMap.set(stateId, visited);
      console.log(`Immediately updated local state: ${stateId} = ${visited}`);
      return newMap;
    });
    
    // Ensure we have a valid stateId before mutating
    const visitedAt = new Date().toISOString();
    
    // Then call the mutation with all required fields
    toggleVisitedMutation.mutate({ 
      stateId, 
      userId, 
      visited, 
      visitedAt 
    });
    
    console.log(`Mutation called with: stateId=${stateId}, userId=${userId}, visited=${visited}`);
  }, [toggleVisitedMutation, userId]);
  
  // Function to reset all states
  const resetAllStates = () => {
    if (window.confirm("Are you sure you want to reset all states to unvisited?")) {
      resetAllMutation.mutate();
    }
  };
  
  // Loading state for component consumers
  const loading = statesLoading || visitedStatesLoading || activitiesLoading;
  
  // Create augmented visitedStates that includes the local state
  const augmentedVisitedStates = useMemo(() => {
    // Start with the API-provided visited states
    let result = [...visitedStates];
    
    // Add any states from local state that aren't in the API data
    if (localVisitedStates.size > 0) {
      localVisitedStates.forEach((isVisited, stateId) => {
        const existingIndex = result.findIndex(vs => vs.stateId === stateId);
        
        if (existingIndex >= 0) {
          // Update existing entry if it differs from local state
          if (result[existingIndex].visited !== isVisited) {
            result[existingIndex] = {
              ...result[existingIndex],
              visited: isVisited
            };
          }
        } else {
          // Add new entry from local state
          result.push({
            id: -1, // Temporary ID
            stateId,
            userId,
            visited: isVisited,
            visitedAt: new Date().toISOString(),
            notes: null
          });
        }
      });
    }
    
    console.log(`Returning ${result.length} augmented visited states`);
    return result;
  }, [visitedStates, localVisitedStates, userId]);
  
  // Create a utility function to check if a state is visited
  const isStateVisited = useCallback((stateId: string): boolean => {
    // First check local state (most up-to-date)
    if (localVisitedStates.has(stateId)) {
      const isVisited = localVisitedStates.get(stateId) ?? false;
      console.log(`isStateVisited (from local state): ${stateId} = ${isVisited}`);
      return isVisited;
    }
    
    // Fall back to API data
    const vsFromAPI = visitedStates.find(vs => vs.stateId === stateId);
    const isVisited = vsFromAPI?.visited ?? false;
    
    // Cache this result in local state for future lookups
    if (vsFromAPI && !localVisitedStates.has(stateId)) {
      setLocalVisitedStates(prev => {
        const newMap = new Map(prev);
        newMap.set(stateId, isVisited);
        return newMap;
      });
    }
    
    console.log(`isStateVisited (from API): ${stateId} = ${isVisited}`);
    return isVisited;
  }, [localVisitedStates, visitedStates]);
  
  return {
    states: states.length ? states : usaStatesData,
    visitedStates: augmentedVisitedStates,
    activities,
    toggleStateVisited,
    resetAllStates,
    loading,
    stats,
    isStateVisited, // New utility function
    localVisitedStatesMap: localVisitedStates, // For direct access if needed
  };
};
