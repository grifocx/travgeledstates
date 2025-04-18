import { Badge, UserBadge } from "@shared/schema";
import { BadgeItem } from "./BadgeItem";
import { Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <Card className="min-h-[200px] flex flex-col items-center justify-center text-center p-6">
        <CardContent className="flex flex-col items-center pt-6">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Award className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl mb-2">No Badges</CardTitle>
          <CardDescription>{emptyMessage}</CardDescription>
        </CardContent>
      </Card>
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
      <Card className="min-h-[200px] flex flex-col items-center justify-center text-center p-6">
        <CardContent className="flex flex-col items-center pt-6">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Award className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl mb-2">No Badges Earned Yet</CardTitle>
          <CardDescription>Keep exploring to earn badges!</CardDescription>
        </CardContent>
      </Card>
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