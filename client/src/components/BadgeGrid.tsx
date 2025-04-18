import { Badge, UserBadge } from "@shared/schema";
import { BadgeItem } from "./BadgeItem";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { Award } from "lucide-react";

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
  emptyMessage = "No badges available",
  size = 'md',
  showAll = true
}: BadgeGridProps) {
  if (!badges || badges.length === 0) {
    return (
      <EmptyPlaceholder className="min-h-[200px]">
        <EmptyPlaceholder.Icon>
          <Award />
        </EmptyPlaceholder.Icon>
        <EmptyPlaceholder.Title>No Badges</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          {emptyMessage}
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    );
  }
  
  // Create a map of earned badges for quick lookup
  const earnedBadgeMap = new Map(
    earnedBadges.map(item => [item.badge.id, item.userBadge])
  );
  
  // If showAll is false, only show earned badges
  const displayBadges = showAll 
    ? badges 
    : badges.filter(badge => earnedBadgeMap.has(badge.id));
  
  if (!showAll && displayBadges.length === 0) {
    return (
      <EmptyPlaceholder className="min-h-[200px]">
        <EmptyPlaceholder.Icon>
          <Award />
        </EmptyPlaceholder.Icon>
        <EmptyPlaceholder.Title>No Badges Earned Yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          Keep exploring to earn badges!
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    );
  }
  
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {displayBadges.map(badge => {
        const userBadge = earnedBadgeMap.get(badge.id);
        const isEarned = !!userBadge;
        
        return (
          <BadgeItem
            key={badge.id}
            badge={badge}
            isEarned={isEarned}
            earnedDate={userBadge?.earnedAt}
            size={size}
          />
        );
      })}
    </div>
  );
}