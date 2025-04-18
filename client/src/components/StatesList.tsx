import { State, VisitedState } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface StatesListProps {
  states: State[];
  visitedStates: VisitedState[];
  toggleStateVisited: (stateId: string, visited: boolean) => void;
  loading: boolean;
  isStateVisited?: (stateId: string) => boolean; // Optional utility function
}

const StatesList = ({ 
  states, 
  visitedStates, 
  toggleStateVisited, 
  loading,
  isStateVisited: isStateVisitedProp 
}: StatesListProps) => {
  // Convert visitedStates array to a map for easy lookup using useMemo
  const visitedStatesMap = useMemo(() => {
    console.log("StatesList: Building map with", visitedStates.length, "visited states");
    
    if (visitedStates.length > 0) {
      console.log("StatesList sample:", visitedStates[0]);
    }
    
    return new Map(
      visitedStates.map(vs => [vs.stateId, vs.visited])
    );
  }, [visitedStates]);

  if (loading) {
    return (
      <div className="mt-8 lg:mt-12 bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">States List</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(50)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 lg:mt-12 bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">States List</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {states.map((state) => {
          // Use isStateVisitedProp if available, otherwise fall back to the map
          let stateIsVisited;
          if (isStateVisitedProp) {
            stateIsVisited = isStateVisitedProp(state.stateId);
          } else {
            stateIsVisited = visitedStatesMap.get(state.stateId) === true;
          }
          
          const statusClass = stateIsVisited 
            ? 'bg-emerald-500 text-white' 
            : 'bg-gray-100 text-gray-700';
          
          return (
            <div 
              key={state.stateId}
              className="state-item flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50"
              onClick={() => toggleStateVisited(state.stateId, !stateIsVisited)}
            >
              <div className={`w-4 h-4 rounded-full ${statusClass}`}></div>
              <span>{state.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatesList;
