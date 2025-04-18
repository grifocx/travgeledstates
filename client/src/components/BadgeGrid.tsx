import { Badge, UserBadge } from "@shared/schema";
import { BadgeItem } from "./BadgeItem";

interface BadgeGridProps {
  badges: Badge[];
  earnedBadges?: {badge: Badge, userBadge: UserBadge}[];
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  showAll?: boolean; // If true, will show both earned and unearned badges
}

export function BadgeGrid({
  badges,
  earnedBadges = [],
  emptyMessage = "No badges to display",
  size = 'md',
  showAll = true
}: BadgeGridProps) {
  // Create a map of badge IDs to userBadge objects for quick lookup
  const earnedBadgeMap = new Map(
    earnedBadges.map(({ badge, userBadge }) => [badge.id, userBadge])
  );
  
  // Filter badges if we're only showing earned ones
  const displayBadges = showAll ? badges : badges.filter(badge => earnedBadgeMap.has(badge.id));
  
  if (displayBadges.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {displayBadges.map((badge) => {
        const userBadge = earnedBadgeMap.get(badge.id);
        const isEarned = !!userBadge;
        const earnedDate = userBadge?.earnedAt ? new Date(userBadge.earnedAt) : undefined;
        
        return (
          <div 
            key={badge.id}
            className="flex flex-col items-center gap-2"
          >
            <BadgeItem
              badge={badge}
              isEarned={isEarned}
              earnedDate={earnedDate}
              size={size}
            />
            <span className="text-xs text-center truncate max-w-full">
              {badge.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}