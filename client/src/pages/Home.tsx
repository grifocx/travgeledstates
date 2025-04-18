import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import MapSection from "@/components/MapSection";
import StateDashboard from "@/components/StateDashboard";
import StatesList from "@/components/StatesList";
import { BadgesSection } from "@/components/BadgesSection";
import Footer from "@/components/Footer";
import ShareModal from "@/components/ShareModal";
import { useVisitedStates } from "@/hooks/useVisitedStates";
import { useAuth } from "@/hooks/use-auth";
import * as htmlToImage from "html-to-image";
import { toast } from "@/hooks/use-toast";

const Home = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [isCapturingMap, setIsCapturingMap] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [sharedMapLoading, setSharedMapLoading] = useState(false);
  const [location] = useLocation();
  const mapSectionRef = useRef<HTMLDivElement>(null);
  
  const { 
    states, 
    visitedStates, 
    activities, 
    toggleStateVisited, 
    resetAllStates,
    loading, 
    stats,
    isStateVisited,
    localVisitedStatesMap,
    userId
  } = useVisitedStates();

  // Debug logging
  useEffect(() => {
    console.log("Home component received visitedStates:", visitedStates);
    
    if (visitedStates.length > 0) {
      console.log("Sample visited state:", visitedStates[0]);
    }
  }, [visitedStates]);
  
  // Handle shared map loading
  useEffect(() => {
    // Check for share query parameter
    const params = new URLSearchParams(window.location.search);
    const shareCode = params.get('share');
    
    if (shareCode) {
      setSharedMapLoading(true);
      
      // Fetch the shared map data from the API
      fetch(`/api/shared-maps/${shareCode}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load shared map: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Set the map image from the retrieved data
          setMapImageUrl(data.imageData);
          setShowShareModal(true);
          
          toast({
            title: "Shared Map Loaded",
            description: "You're viewing a shared map.",
          });
        })
        .catch(error => {
          console.error("Error loading shared map:", error);
          toast({
            title: "Error",
            description: "Could not load the shared map. It may have expired or been removed.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setSharedMapLoading(false);
        });
    }
  }, [location]);

  // Capture map image when the modal is opened
  const captureMapAsImage = useCallback(async () => {
    if (!mapSectionRef.current) {
      console.error("Map section ref is not available");
      return null;
    }

    try {
      setIsCapturingMap(true);
      
      // Find the map container within the map section (using the specific ID)
      const mapContainer = mapSectionRef.current.querySelector("#usa-map-container");
      if (!mapContainer) {
        throw new Error("Map container not found");
      }
      
      // Capture the map as a JPEG data URL (more efficient than PNG for this use case)
      const dataUrl = await htmlToImage.toJpeg(mapContainer as HTMLElement, {
        quality: 0.5, // Very low quality to minimize file size
        backgroundColor: "#ffffff",
        width: 600, // Smaller width to reduce size
        height: 450, // Smaller height to reduce size
        // Optional: Filter out any external resources that might cause CORS issues
        filter: (node) => {
          // Skip SVG <use> elements that reference external resources
          if (node instanceof SVGUseElement && node.href.baseVal.startsWith('http')) {
            return false;
          }
          return true;
        }
      });
      
      setMapImageUrl(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error("Error capturing map image:", error);
      toast({
        title: "Error capturing map",
        description: "Unable to create a shareable image. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCapturingMap(false);
    }
  }, [mapSectionRef]);

  const handleShare = async () => {
    // Open the modal first to show loading state
    setShowShareModal(true);
    setMapImageUrl(null); // Reset any existing image
    
    // Slight delay to ensure modal is fully open before capturing
    setTimeout(async () => {
      const imageUrl = await captureMapAsImage();
      
      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Could not capture map image. Please try again.",
          variant: "destructive"
        });
      }
    }, 200);
  };

  const handleStateClick = (stateId: string) => {
    setSelectedState(stateId);
    // Mobile devices will show the info panel
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div ref={mapSectionRef} className="lg:col-span-2 mb-8 lg:mb-0">
            <MapSection 
              states={states}
              visitedStates={visitedStates}
              onStateClick={handleStateClick}
              selectedState={selectedState}
              toggleStateVisited={toggleStateVisited}
              loading={loading}
              isStateVisited={isStateVisited}
              stats={stats}
            />
          </div>
          
          <StateDashboard 
            stats={stats}
            activities={activities}
            onReset={resetAllStates}
            onShare={handleShare}
            loading={loading}
          />
        </div>
        
        <StatesList 
          states={states}
          visitedStates={visitedStates}
          toggleStateVisited={toggleStateVisited}
          loading={loading}
          isStateVisited={isStateVisited}
        />
        
        <div className="mt-8">
          <BadgesSection userId={userId} />
        </div>
      </main>
      
      <Footer />
      
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        mapImageUrl={mapImageUrl}
        userId={userId}
      />
    </div>
  );
};

export default Home;
