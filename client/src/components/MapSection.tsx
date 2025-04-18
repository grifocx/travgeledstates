import { useState, useEffect, useMemo } from "react";
import { 
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Tooltip } from "@/components/ui/tooltip";
import { VisitedState, State } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define TypeScript types for Geography data
interface GeoFeature {
  rsmKey: string;
  properties: {
    iso_3166_2: string;
    name: string;
    [key: string]: any;
  };
  geometry: any;
}

// Import the US topojson map data from CDN
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface MapSectionProps {
  states: State[];
  visitedStates: VisitedState[];
  onStateClick: (stateId: string) => void;
  selectedState: string | null;
  toggleStateVisited: (stateId: string, visited: boolean) => void;
  loading: boolean;
}

const MapSection = ({ 
  states, 
  visitedStates, 
  onStateClick, 
  selectedState, 
  toggleStateVisited,
  loading 
}: MapSectionProps) => {
  const [position, setPosition] = useState({ zoom: 1, coordinates: [0, 0] });
  const [mobileInfoVisible, setMobileInfoVisible] = useState(false);
  const [selectedStateName, setSelectedStateName] = useState("");
  const [isStateVisited, setIsStateVisited] = useState(false);

  // Convert visitedStates array to a map for easy lookup
  // Use useMemo to properly cache and update the map only when visitedStates changes
  const visitedStatesMap = useMemo(() => {
    const stateMap = new Map();
    
    // Log for debugging
    console.log(`Creating map with: ${visitedStates.length} visited states`);
    
    // Populate with data
    visitedStates.forEach((vs: VisitedState) => {
      console.log(`Adding state ${vs.stateId}: visited=${vs.visited}`);
      stateMap.set(vs.stateId, vs.visited);
    });
    
    return stateMap;
  }, [visitedStates]);

  useEffect(() => {
    if (selectedState) {
      const state = states.find(s => s.stateId === selectedState);
      setSelectedStateName(state ? state.name : "");
      setIsStateVisited(visitedStatesMap.get(selectedState) === true);
      setMobileInfoVisible(true);
    } else {
      setMobileInfoVisible(false);
    }
  }, [selectedState, states, visitedStatesMap]);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(prev => ({ ...prev, zoom: prev.zoom * 1.2 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(prev => ({ ...prev, zoom: prev.zoom / 1.2 }));
  };

  const handleResetZoom = () => {
    setPosition({ zoom: 1, coordinates: [0, 0] });
  };

  const handleToggleSelectedState = () => {
    if (selectedState) {
      toggleStateVisited(selectedState, !isStateVisited);
    }
  };

  const handleStateClick = (stateId: string, stateName: string) => {
    onStateClick(stateId);
  };

  if (loading) {
    return (
      <div className="lg:col-span-2 mb-8 lg:mb-0">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Your USA Travel Map</h2>
          <Skeleton className="w-full aspect-[1.5/1] rounded-lg" />
          <div className="mt-4 flex justify-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 mb-8 lg:mb-0">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">Your USA Travel Map</h2>
        
        <div className="relative aspect-[1.5/1] overflow-hidden border border-gray-200 rounded-lg">
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{
              scale: 1000
            }}
            style={{
              width: "100%",
              height: "auto"
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: GeoFeature[] }) =>
                geographies.map((geo: GeoFeature) => {
                  const stateId = geo.properties.iso_3166_2;
                  const isVisited = visitedStatesMap.get(stateId) === true;
                  const isSelected = selectedState === stateId;
                  const stateName = states.find(s => s.stateId === stateId)?.name || geo.properties.name;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(stateId, stateName)}
                      style={{
                        default: {
                          fill: isVisited ? "#10B981" : "#D1D5DB",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                        hover: {
                          fill: isVisited ? "#059669" : "#9CA3AF",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.75,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#10B981",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.75,
                          outline: "none",
                        }
                      }}
                      className={`state ${isVisited ? 'visited' : ''} ${isSelected ? 'selected' : ''}`}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          
          {/* Mobile Info Panel (shows when state is tapped) */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3 transform transition-transform duration-300 sm:hidden ${
              mobileInfoVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{selectedStateName}</h3>
              <Button
                variant={isStateVisited ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleSelectedState}
              >
                {isStateVisited ? 'Mark as Unvisited' : 'Mark as Visited'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
            <span className="text-sm">Visited</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span className="text-sm">Not Visited</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
            <span className="text-sm">Hover/Selected</span>
          </div>
        </div>
        
        {/* Map Controls */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetZoom}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
