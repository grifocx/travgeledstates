import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { ThemeProvider } from "next-themes";

function Router() {
  const [location, setLocation] = useLocation();
  const [processedShare, setProcessedShare] = useState(false);
  
  // Parse share parameter from URL if present
  useEffect(() => {
    if (location.includes('share=') && !processedShare) {
      const params = new URLSearchParams(location.split('?')[1]);
      const shareParam = params.get('share');
      
      if (shareParam) {
        try {
          // Decode the share data
          const shareData = atob(shareParam);
          const [sharedUserId, statesList] = shareData.split(':');
          const sharedStates = statesList.split(',');
          
          toast({
            title: "Viewing shared map",
            description: `Showing map with ${sharedStates.length} visited states`,
          });
          
          // Clear share parameter from URL
          setLocation('/', { replace: true });
          setProcessedShare(true);
          
        } catch (error) {
          console.error('Failed to process share URL:', error);
          toast({
            title: "Error",
            description: "Failed to load the shared map",
            variant: "destructive",
          });
        }
      }
    }
  }, [location, setLocation, processedShare]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
