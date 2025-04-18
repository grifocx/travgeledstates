import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

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

// Utility function to convert full state names to state codes
const stateNameToCode: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", 
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", 
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", 
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY"
};

interface MapSectionProps {
  states: State[];
  visitedStates: VisitedState[];
  onStateClick: (stateId: string) => void;
  selectedState: string | null;
  toggleStateVisited: (stateId: string, visited: boolean) => void;
  loading: boolean;
  isStateVisited?: (stateId: string) => boolean; // Optional utility function
}

const MapSection = ({ 
  states, 
  visitedStates, 
  onStateClick, 
  selectedState, 
  toggleStateVisited,
  loading,
  isStateVisited: isStateVisitedProp // Rename to avoid conflict with state
}: MapSectionProps) => {
  const [position, setPosition] = useState({ zoom: 1, coordinates: [0, 0] });
  const [mobileInfoVisible, setMobileInfoVisible] = useState(false);
  const [selectedStateName, setSelectedStateName] = useState("");
  const [isStateVisited, setIsStateVisited] = useState(false);

  // Use local state management for visited states
  const [localVisitedStates, setLocalVisitedStates] = useState<Map<string, boolean>>(new Map());
  const firstRenderRef = useRef(true);
  const queryClient = useQueryClient();
  
  // Initialize and update localVisitedStates from visitedStates props
  useEffect(() => {
    console.log("MapSection: Updating local visited states from props");
    const newMap = new Map<string, boolean>();
    
    // Populate the map with all visited states
    visitedStates.forEach((vs: VisitedState) => {
      if (vs.visited) {
        newMap.set(vs.stateId, vs.visited);
        console.log(`MapSection: State ${vs.stateId} is set to VISITED`);
      }
    });
    
    // Log all visited states
    if (newMap.size > 0) {
      console.log(`MapSection: Loaded ${newMap.size} visited states`);
    } else {
      console.log("MapSection: No visited states found in props");
    }
    
    setLocalVisitedStates(newMap);
  }, [visitedStates]);
  
  // Check if a state is visited - prefer isStateVisitedProp if available
  const checkIfStateVisited = useCallback((stateId: string): boolean => {
    if (isStateVisitedProp) {
      return isStateVisitedProp(stateId);
    }
    
    // Then check our local state
    if (localVisitedStates.has(stateId)) {
      return localVisitedStates.get(stateId) || false;
    }
    
    // Finally fall back to visitedStates prop
    return visitedStates.some(vs => vs.stateId === stateId && vs.visited);
  }, [isStateVisitedProp, localVisitedStates, visitedStates]);
  
  // Handle state clicks with immediate visual feedback
  const handleStateToggle = useCallback((stateId: string) => {
    if (!stateId) {
      console.error("MapSection: Cannot toggle state with undefined stateId");
      toast({
        title: "Error",
        description: "Cannot update state: missing state ID",
        variant: "destructive"
      });
      return;
    }
    
    // Toggle the current state
    const currentStatus = checkIfStateVisited(stateId);
    const newStatus = !currentStatus;
    
    console.log(`MapSection: User toggled ${stateId} from ${currentStatus ? 'VISITED' : 'NOT VISITED'} to ${newStatus ? 'VISITED' : 'NOT VISITED'}`);
    
    // Update local state immediately for UI feedback
    setLocalVisitedStates(prev => {
      const newMap = new Map(prev);
      newMap.set(stateId, newStatus);
      return newMap;
    });
    
    // Set a render key to force the specific state to re-render
    const renderKey = `${stateId}-${newStatus ? 'visited' : 'not-visited'}-${Date.now()}`;
    console.log(`Setting unique render key: ${renderKey}`);
    
    // Call the parent's toggle function
    toggleStateVisited(stateId, newStatus);
    
    // Show immediate feedback to the user
    toast({
      title: newStatus ? "State Marked as Visited" : "State Marked as Not Visited",
      description: `${states.find(s => s.stateId === stateId)?.name || stateId} has been updated.`,
      duration: 2000
    });
  }, [checkIfStateVisited, toggleStateVisited, states]);

  // Update selected state info when selection changes
  useEffect(() => {
    if (selectedState) {
      const state = states.find(s => s.stateId === selectedState);
      setSelectedStateName(state ? state.name : "");
      
      // Use our checkIfStateVisited function for consistency
      const stateVisited = checkIfStateVisited(selectedState);
      console.log(`Selected state ${selectedState} is ${stateVisited ? 'visited' : 'not visited'}`);
      
      setIsStateVisited(stateVisited);
      setMobileInfoVisible(true);
    } else {
      setMobileInfoVisible(false);
    }
  }, [selectedState, states, checkIfStateVisited]);

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
      handleStateToggle(selectedState);
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
        
        <div className="relative aspect-[1.5/1] overflow-hidden border border-gray-200 rounded-lg" id="usa-map-container">
          {/* Watermark - Only visible in screenshots */}
          <div className="absolute bottom-3 right-3 z-10 bg-white bg-opacity-80 px-3 py-1.5 rounded text-sm text-gray-700 shadow-sm" id="map-watermark">
            <div className="font-medium">USA States Tracker</div>
          </div>

          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{
              scale: 1000
            }}
            style={{
              width: "100%",
              height: "auto"
            }}
            data-html2canvas-ignore-scrolling="true"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: GeoFeature[] }) =>
                geographies.map((geo: GeoFeature) => {
                  // Extract the state ID from the properties - this is crucial
                  let stateId = geo.properties.iso_3166_2;
                  
                  // Debug the geography properties if stateId is undefined
                  if (!stateId) {
                    // Try alternative property names first
                    stateId = geo.properties.postal || geo.properties.abbr || geo.properties.STUSPS;
                    
                    // If still undefined, try to map from state name to state code
                    if (!stateId && geo.properties.name) {
                      const stateName = geo.properties.name;
                      stateId = stateNameToCode[stateName];
                      
                      console.log(`Mapping from name "${stateName}" to state code: ${stateId || 'NOT FOUND'}`);
                    }
                    
                    // If we still don't have a valid stateId, log the issue
                    if (!stateId) {
                      console.log("Found geography without state ID:", geo.properties);
                    }
                  }
                  
                  // Use our consistent function to check state visited status
                  const stateVisited = stateId ? checkIfStateVisited(stateId) : false;
                  
                  const isSelected = selectedState === stateId;
                  const stateName = stateId ? (states.find(s => s.stateId === stateId)?.name || geo.properties.name) : geo.properties.name;
                  
                  // Debug logging for specific states
                  if (stateId === "CA" || stateId === "NY" || stateId === "TX" || stateId === "FL" || stateId === selectedState) {
                    console.log(`Rendering state ${stateId} (${stateName}): visited=${stateVisited}, selected=${isSelected}`);
                  }
                  
                  // Set fill color based on state
                  const fillColor = stateVisited ? "#10B981" : "#D1D5DB";
                  const hoverColor = stateVisited ? "#059669" : "#9CA3AF";
                  
                  return (
                    <Geography
                      key={`${geo.rsmKey}-${stateVisited ? 'visited' : 'not'}`}
                      geography={geo}
                      onClick={() => {
                        if (stateId) {
                          console.log(`Direct click on state with ID: ${stateId}`);
                          handleStateToggle(stateId);
                        } else {
                          console.error("Clicked on a state without ID");
                          toast({
                            title: "Error",
                            description: "Could not identify the clicked state",
                            variant: "destructive"
                          });
                        }
                      }}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: "#FFFFFF",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                        hover: {
                          fill: hoverColor,
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
                      className={`state ${stateVisited ? 'visited' : ''} ${isSelected ? 'selected' : ''}`}
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
