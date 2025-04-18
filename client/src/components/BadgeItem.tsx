import { Badge, UserBadge } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Verified, Lock } from "lucide-react";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { format } from "date-fns";

export interface BadgeItemProps {
  badge: Badge;
  isEarned?: boolean;
  earnedDate?: Date;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onClick?: () => void;
}

const tierColors = {
  1: 'bg-[#CD7F32] text-white', // Bronze
  2: 'bg-[#C0C0C0] text-white', // Silver
  3: 'bg-[#FFD700] text-black', // Gold
};

const sizesMap = {
  sm: {
    card: 'w-24 h-32',
    image: 'w-14 h-14',
    title: 'text-xs',
    badge: 'text-[10px] px-1.5 py-0.5',
    icon: 'h-3 w-3'
  },
  md: {
    card: 'w-32 h-44',
    image: 'w-20 h-20',
    title: 'text-sm',
    badge: 'text-xs px-2 py-0.5',
    icon: 'h-3.5 w-3.5'
  },
  lg: {
    card: 'w-40 h-56',
    image: 'w-24 h-24',
    title: 'text-base',
    badge: 'text-sm px-2 py-1',
    icon: 'h-4 w-4'
  }
};

export function BadgeItem({
  badge,
  isEarned = false,
  earnedDate,
  size = 'md',
  showTooltip = true,
  onClick
}: BadgeItemProps) {
  const sizeClasses = sizesMap[size];
  const tierColor = tierColors[badge.tier as keyof typeof tierColors] || tierColors[1];
  
  const badgeContent = (
    <Card 
      className={cn(
        sizeClasses.card,
        "flex flex-col items-center justify-between overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md",
        isEarned ? "border-primary/30" : "opacity-60 grayscale border-muted/50",
        onClick ? "hover:scale-105" : ""
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-0 text-center w-full">
        <CardTitle className={cn("font-semibold truncate w-full", sizeClasses.title)}>
          {badge.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 pb-0 flex items-center justify-center">
        <div
          className={cn(
            "relative rounded-full p-1 flex items-center justify-center",
            isEarned ? "bg-primary/10" : "bg-muted"
          )}
        >
          <img 
            src={badge.imageUrl} 
            alt={badge.name}
            className={cn(sizeClasses.image, "rounded-full")} 
          />
          {isEarned && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
              <Verified className={sizeClasses.icon} />
            </div>
          )}
          {!isEarned && (
            <div className="absolute -bottom-1 -right-1 bg-gray-500 text-white rounded-full p-0.5">
              <Lock className={sizeClasses.icon} />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-0 w-full flex flex-col items-center gap-1">
        <BadgeUI 
          variant="outline" 
          className={cn(
            sizeClasses.badge, 
            tierColor
          )}
        >
          Tier {badge.tier}
        </BadgeUI>
        
        {isEarned && earnedDate && size !== 'sm' && (
          <p className="text-[10px] text-muted-foreground">
            Earned {format(new Date(earnedDate), 'MMM d, yyyy')}
          </p>
        )}
      </CardFooter>
    </Card>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{badge.name}</p>
              <p className="text-sm">{badge.description}</p>
              {isEarned && earnedDate && (
                <p className="text-xs text-muted-foreground">
                  Earned on {format(new Date(earnedDate), 'MMMM d, yyyy')}
                </p>
              )}
              {!isEarned && (
                <p className="text-xs text-muted-foreground italic">Complete the required criteria to unlock</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return badgeContent;
}