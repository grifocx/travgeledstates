import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Facebook, Twitter, Download, Share2 } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapImageUrl: string | null;
}

const ShareModal = ({ isOpen, onClose, mapImageUrl }: ShareModalProps) => {
  const [isCopying, setIsCopying] = useState(false);

  const handleDownloadImage = () => {
    if (!mapImageUrl) {
      toast({
        title: "Error",
        description: "No image available to download",
        variant: "destructive",
      });
      return;
    }

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
  };

  const handleCopyToClipboard = async () => {
    if (!mapImageUrl) {
      toast({
        title: "Error",
        description: "No image available to copy",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCopying(true);

      // Alternative approach using a canvas element
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      // Create a promise to handle image loading
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = mapImageUrl;
      });

      // Create canvas and draw image
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Try to copy from canvas
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Try the ClipboardItem API first
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            
            toast({
              title: "Copied!",
              description: "Image copied to clipboard. You can paste it anywhere!",
            });
          } catch (innerErr) {
            console.error("ClipboardItem API failed:", innerErr);
            
            // Download fallback if copy fails
            toast({
              title: "Clipboard access denied",
              description: "Using download instead. You can then share the downloaded image.",
              duration: 5000
            });
            
            // Trigger download automatically
            const link = document.createElement("a");
            link.href = mapImageUrl;
            link.download = "my-usa-states-map.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          throw new Error("Could not create blob from canvas");
        }
        setIsCopying(false);
      }, "image/png");
      
    } catch (err) {
      console.error("Failed to copy image: ", err);
      toast({
        title: "Failed to copy",
        description: "Could not copy the image. Try downloading instead.",
        variant: "destructive",
      });
      setIsCopying(false);
    }
  };

  const handleShareFacebook = () => {
    // Facebook requires a URL to share, not a direct image
    // We'll fall back to sharing the current page URL
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleShareTwitter = () => {
    // Twitter requires a URL to share, not a direct image
    // We'll fall back to sharing the current page URL
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out my USA states tracking map!')}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Map</DialogTitle>
          <DialogDescription>
            Share your state tracking progress with friends and family!
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
          {/* Primary actions */}
          <div className="flex space-x-3">
            <Button
              variant="default"
              onClick={handleDownloadImage}
              disabled={!mapImageUrl}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Image
            </Button>
          </div>
          
          {/* Secondary actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              disabled={!mapImageUrl || isCopying}
              className="flex items-center justify-center"
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-1" />
              {isCopying ? "..." : "Copy"}
            </Button>
            
            <Button
              variant="outline"
              className="bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center"
              onClick={handleShareFacebook}
              disabled={!mapImageUrl}
              size="sm"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              className="bg-[#1DA1F2] hover:bg-[#1a94da] text-white flex items-center justify-center"
              onClick={handleShareTwitter}
              disabled={!mapImageUrl}
              size="sm"
            >
              <Twitter className="h-4 w-4" />
            </Button>
          </div>
          
          {mapImageUrl && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Download the image to share it on other platforms
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
