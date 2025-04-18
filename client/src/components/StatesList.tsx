import { State, VisitedState } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface StatesListProps {
  states: State[];
  visitedStates: VisitedState[];
  toggleStateVisited: (stateId: string, visited: boolean) => void;
  loading: boolean;
}

const StatesList = ({ states, visitedStates, toggleStateVisited, loading }: StatesListProps) => {
  // Convert visitedStates array to a map for easy lookup
  const visitedStatesMap = new Map(
    visitedStates.map(vs => [vs.stateId, vs.visited])
  );

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
          const isVisited = visitedStatesMap.get(state.stateId) === true;
          const statusClass = isVisited 
            ? 'bg-emerald-500 text-white' 
            : 'bg-gray-100 text-gray-700';
          
          return (
            <div 
              key={state.stateId}
              className="state-item flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50"
              onClick={() => toggleStateVisited(state.stateId, !isVisited)}
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
