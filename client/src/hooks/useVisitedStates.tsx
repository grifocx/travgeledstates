import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Activity, State, VisitedState } from "@shared/schema";
import { usaStatesData } from "@/lib/usaStatesData";
import { toast } from "@/hooks/use-toast";

// Generate a simple user ID for the session (in a real app, this would be authenticated)
const getUserId = () => {
  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("user_id", userId);
  }
  return userId;
};

export const useVisitedStates = () => {
  const userId = getUserId();
  const queryClient = useQueryClient();
  
  // Fetch states
  const { 
    data: states = [],
    isLoading: statesLoading,
    error: statesError
  } = useQuery({
    queryKey: ["/api/states"],
    staleTime: Infinity, // States don't change
  });
  
  // Fetch visited states
  const { 
    data: visitedStates = [],
    isLoading: visitedStatesLoading,
    error: visitedStatesError,
  } = useQuery({
    queryKey: [`/api/visited-states/${userId}`],
    refetchOnWindowFocus: true,
  });
  
  // Fetch activities
  const { 
    data: activities = [],
    isLoading: activitiesLoading,
    error: activitiesError
  } = useQuery({
    queryKey: [`/api/activities/${userId}`],
    refetchOnWindowFocus: true,
  });
  
  // Toggle visited state mutation
  const toggleVisitedMutation = useMutation({
    mutationFn: async ({ stateId, visited }: { stateId: string, visited: boolean }) => {
      const visitedAt = new Date().toISOString();
      const response = await apiRequest("POST", "/api/visited-states/toggle", {
        stateId,
        userId,
        visited,
        visitedAt
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/visited-states/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/activities/${userId}`] });
    },
    onError: (error) => {
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
    const visitedCount = visitedStates.filter(vs => vs.visited).length;
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
