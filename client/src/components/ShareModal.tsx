import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, Share2, Copy, Link, CheckCircle2, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapImageUrl: string | null;
  userId: string;
}

const ShareModal = ({ isOpen, onClose, mapImageUrl, userId }: ShareModalProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  
  // Check if we're viewing a shared map (from URL param)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsSharedView(!!params.get('share'));
  }, []);

  const handleDownloadImage = () => {
    if (!mapImageUrl) {
      toast({
        title: "Error",
        description: "No image available to download",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Create a temporary link element to download the image
      const link = document.createElement("a");
      link.href = mapImageUrl;
      link.download = "my-usa-states-map.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success!",
        description: "Your map image has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateShareUrl = async () => {
    if (!mapImageUrl || !userId) {
      toast({
        title: "Error",
        description: "Cannot generate share URL without image data",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      // Save the image data to the server and get a share URL
      const response = await fetch("/api/shared-maps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          imageData: mapImageUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get the application's base URL for constructing the share URL
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared/${data.shareCode}`;
      
      setShareUrl(shareUrl);
      toast({
        title: "Share URL Generated!",
        description: "You can now share this link with others.",
      });
    } catch (error) {
      console.error("Error generating share URL:", error);
      toast({
        title: "Error",
        description: "Failed to generate share URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });

      // Reset copy success after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSharedView ? "Shared Map View" : "Share Your Map"}</DialogTitle>
          <DialogDescription>
            {isSharedView 
              ? "You're viewing a map shared by another user" 
              : "Share your state tracking progress with friends and family!"}
          </DialogDescription>
        </DialogHeader>
        
        {mapImageUrl ? (
          <div className="bg-gray-100 p-3 rounded-lg mb-4 flex justify-center">
            <img 
              src={mapImageUrl} 
              alt="My USA States Map" 
              className="max-w-full rounded-md border border-gray-200 shadow-sm"
            />
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg mb-4 flex flex-col justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
            <p className="text-gray-500">Capturing your map...</p>
            <p className="text-gray-400 text-xs mt-1">This may take a few seconds</p>
          </div>
        )}
        
        <div className="space-y-3">
          {isSharedView ? (
            <>
              {/* Actions for shared view mode */}
              <div className="grid gap-3">
                <Button
                  variant="default"
                  onClick={handleDownloadImage}
                  disabled={!mapImageUrl || isDownloading}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download Image"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    window.history.pushState({}, "", "/");
                    window.location.reload();
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Create Your Own Map
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-2">
                Create and track your own visited states
              </p>
            </>
          ) : !shareUrl ? (
            <>
              {/* Primary actions - before sharing */}
              <div className="grid gap-3">
                <Button
                  variant="default"
                  onClick={handleGenerateShareUrl}
                  disabled={!mapImageUrl || isSharing}
                  className="flex items-center justify-center gap-2"
                >
                  {isSharing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full"></div>
                      Generating Share Link...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Generate Share Link
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadImage}
                  disabled={!mapImageUrl || isDownloading}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download Image"}
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-2">
                Create a shareable link that others can view
              </p>
            </>
          ) : (
            <>
              {/* After share URL is generated */}
              <div className="bg-gray-50 border rounded-md flex p-2">
                <div className="flex-1 overflow-hidden text-sm py-1 px-2 text-gray-500 whitespace-nowrap overflow-ellipsis">
                  {shareUrl}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="ml-1"
                >
                  {copySuccess ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  Copy Link
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadImage}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareUrl && window.open(shareUrl, '_blank')}
                  className="flex items-center justify-center gap-2 col-span-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
                
              <p className="text-xs text-center text-gray-500 mt-2">
                Anyone with this link can view your map
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
