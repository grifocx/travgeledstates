import { cn } from "@/lib/utils";
import { Badge } from "@shared/schema";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Star } from "lucide-react";

// Default badge SVG paths for different tiers
const BADGE_PLACEHOLDER_PATHS: Record<number, string> = {
  1: "/badges/placeholder-bronze.svg", 
  2: "/badges/placeholder-silver.svg",
  3: "/badges/placeholder-gold.svg",
  4: "/badges/placeholder-platinum.svg",
};

export interface BadgeItemProps {
  badge: Badge;
  isEarned?: boolean;
  earnedDate?: Date;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onClick?: () => void;
}

export function BadgeItem({
  badge,
  isEarned = false,
  earnedDate,
  size = 'md',
  showTooltip = true,
  onClick
}: BadgeItemProps) {
  const sizesMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };
  
  const tierToLabel = {
    1: 'Bronze',
    2: 'Silver',
    3: 'Gold',
    4: 'Platinum'
  };
  
  const placeholder = BADGE_PLACEHOLDER_PATHS[badge.tier] || BADGE_PLACEHOLDER_PATHS[1];
  
  // Badge image with fallback
  const BadgeImage = (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full border transition-all duration-200",
        sizesMap[size],
        isEarned 
          ? "border-primary bg-background shadow-sm" 
          : "border-muted bg-muted opacity-50 grayscale",
        onClick && "cursor-pointer hover:scale-110"
      )}
      onClick={onClick}
    >
      <img 
        src={badge.imageUrl || placeholder}
        alt={badge.name}
        className="w-full h-full p-2 object-contain"
        onError={(e) => {
          // Fallback if image doesn't load
          (e.target as HTMLImageElement).src = placeholder;
        }}
      />
      
      {/* Display tier stars */}
      <div className="absolute -bottom-1 flex">
        {Array.from({ length: badge.tier }).map((_, i) => (
          <Star 
            key={i} 
            size={size === 'sm' ? 10 : size === 'md' ? 12 : 16} 
            className={isEarned ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} 
          />
        ))}
      </div>
    </div>
  );
  
  if (!showTooltip) {
    return BadgeImage;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {BadgeImage}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg">{badge.name}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {tierToLabel[badge.tier as keyof typeof tierToLabel] || 'Badge'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          
          {isEarned && earnedDate && (
            <p className="text-xs text-primary mt-1">
              Earned on {earnedDate.toLocaleDateString()}
            </p>
          )}
          
          {!isEarned && (
            <p className="text-xs text-muted-foreground italic mt-1">
              Not yet earned
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}