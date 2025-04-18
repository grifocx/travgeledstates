import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MapSection from "@/components/MapSection";
import StateDashboard from "@/components/StateDashboard";
import StatesList from "@/components/StatesList";
import Footer from "@/components/Footer";
import ShareModal from "@/components/ShareModal";
import { useVisitedStates } from "@/hooks/useVisitedStates";

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
    stats 
  } = useVisitedStates();

  // Generate a share URL when the modal is opened
  useEffect(() => {
    if (showShareModal) {
      const shareCode = Math.random().toString(36).substring(2, 10);
      setShareUrl(`${window.location.origin}/share/${shareCode}`);
    }
  }, [showShareModal]);

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
