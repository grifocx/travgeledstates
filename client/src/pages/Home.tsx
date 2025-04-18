import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MapSection from "@/components/MapSection";
import StateDashboard from "@/components/StateDashboard";
import StatesList from "@/components/StatesList";
import Footer from "@/components/Footer";
import ShareModal from "@/components/ShareModal";
import { useVisitedStates } from "@/hooks/useVisitedStates";
import { useAuth } from "@/hooks/use-auth";

const Home = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  const { 
    states, 
    visitedStates, 
    activities, 
    toggleStateVisited, 
    resetAllStates,
    loading, 
    stats,
    isStateVisited,
    localVisitedStatesMap
  } = useVisitedStates();

  // Debug logging
  useEffect(() => {
    console.log("Home component received visitedStates:", visitedStates);
    
    if (visitedStates.length > 0) {
      console.log("Sample visited state:", visitedStates[0]);
    }
  }, [visitedStates]);

  // Generate a share URL when the modal is opened
  useEffect(() => {
    if (showShareModal) {
      const userId = localStorage.getItem("user_id") || "anonymous";
      const stateIds = visitedStates
        .filter(vs => vs.visited)
        .map(vs => vs.stateId)
        .join(',');
      
      // Create a shareable URL with visited states encoded
      const shareCode = btoa(`${userId}:${stateIds}`);
      setShareUrl(`${window.location.origin}?share=${shareCode}`);
    }
  }, [showShareModal, visitedStates]);

  const handleShare = () => {
    setShowShareModal(true);
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
          <MapSection 
            states={states}
            visitedStates={visitedStates}
            onStateClick={handleStateClick}
            selectedState={selectedState}
            toggleStateVisited={toggleStateVisited}
            loading={loading}
          />
          
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
        />
      </main>
      
      <Footer />
      
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export default Home;
