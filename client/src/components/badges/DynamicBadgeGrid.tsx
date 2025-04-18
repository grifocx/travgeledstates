import React from 'react';
import { Badge, UserBadge } from '@shared/schema';
import { DynamicBadge } from './DynamicBadge';
import { EmptyPlaceholder } from '@/components/ui/empty-placeholder';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DynamicBadgeGridProps {
  badges: Badge[];
  earnedBadges?: {badge: Badge, userBadge: UserBadge}[];
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  showAll?: boolean; // If true, will show both earned and unearned badges
  className?: string;
  animateNewBadges?: boolean;
}

export function DynamicBadgeGrid({
  badges,
  earnedBadges = [],
  emptyMessage = "No badges yet. Mark states as visited to earn badges!",
  size = 'md',
  showAll = false,
  className,
  animateNewBadges = false
}: DynamicBadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = React.useState<{badge: Badge, earned: boolean, earnedDate?: Date} | null>(null);
  
  // Map of earned badge IDs for quick lookups
  const earnedBadgeMap = React.useMemo(() => {
    const map = new Map<number, UserBadge>();
    earnedBadges.forEach(({badge, userBadge}) => {
      map.set(badge.id, userBadge);
    });
    return map;
  }, [earnedBadges]);
  
  // Badges to display
  const displayBadges = React.useMemo(() => {
    if (showAll) {
      return badges.map(badge => ({
        badge,
        earned: earnedBadgeMap.has(badge.id),
        earnedDate: earnedBadgeMap.get(badge.id)?.earnedAt
      }));
    }
    return earnedBadges.map(({badge, userBadge}) => ({
      badge,
      earned: true,
      earnedDate: userBadge.earnedAt
    }));
  }, [badges, earnedBadges, showAll, earnedBadgeMap]);
  
  // Organized badges by category
  const organizedBadges = React.useMemo(() => {
    const organized = displayBadges.reduce((acc, badgeData) => {
      const category = badgeData.badge.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(badgeData);
      return acc;
    }, {} as Record<string, typeof displayBadges>);
    
    // Sort categories: milestone, regional, special, then others alphabetically
    const categoryOrder = ['milestone', 'regional', 'special'];
    return Object.entries(organized).sort(([catA], [catB]) => {
      const indexA = categoryOrder.indexOf(catA);
      const indexB = categoryOrder.indexOf(catB);
      
      if (indexA === -1 && indexB === -1) return catA.localeCompare(catB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [displayBadges]);

  // Category titles
  const categoryTitles = {
    milestone: 'Exploration Milestones',
    regional: 'Regional Completionist',
    special: 'Special Achievements',
    other: 'Other Achievements'
  };
  
  // If there are no badges to display, show empty message
  if (displayBadges.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        </EmptyPlaceholder.Icon>
        <EmptyPlaceholder.Title>No Badges Earned Yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          {emptyMessage}
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {organizedBadges.map(([category, badges]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold">
            {categoryTitles[category as keyof typeof categoryTitles] || category}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {badges.map(({badge, earned, earnedDate}) => (
                <motion.div 
                  key={badge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <DynamicBadge 
                    badge={badge}
                    isEarned={earned}
                    earnedDate={earnedDate}
                    size={size}
                    onClick={() => setSelectedBadge({badge, earned, earnedDate})}
                    animate={animateNewBadges && earned}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
      
      {/* Badge Details Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBadge?.badge.name}
            </DialogTitle>
            <DialogDescription>
              {selectedBadge?.badge.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {selectedBadge && (
              <DynamicBadge 
                badge={selectedBadge.badge}
                isEarned={selectedBadge.earned}
                earnedDate={selectedBadge.earnedDate}
                size="lg"
                animate={selectedBadge.earned}
              />
            )}
          </div>
          
          {selectedBadge?.earned && selectedBadge.earnedDate && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              Earned on {new Date(selectedBadge.earnedDate).toLocaleDateString()}
            </div>
          )}
          
          {!selectedBadge?.earned && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <h4 className="font-medium mb-1">How to earn this badge:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedBadge?.badge.description}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}