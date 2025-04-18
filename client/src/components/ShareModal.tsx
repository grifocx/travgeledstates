import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Facebook, Twitter, X } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareModal = ({ isOpen, onClose, shareUrl }: ShareModalProps) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The share link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my USA states tracking map!')}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
          <DialogDescription>
            Share your state tracking progress with friends and family!
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-100 p-3 rounded-lg mb-4">
          <p className="text-sm break-all">{shareUrl}</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="default"
            className="flex-1"
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="bg-[#1877F2] hover:bg-[#166fe5] text-white"
              size="icon"
              onClick={handleShareFacebook}
            >
              <Facebook className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              className="bg-[#1DA1F2] hover:bg-[#1a94da] text-white"
              size="icon"
              onClick={handleShareTwitter}
            >
              <Twitter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
