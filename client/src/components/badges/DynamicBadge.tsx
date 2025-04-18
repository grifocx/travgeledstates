import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@shared/schema';

// Define badge tiers and their colors
const tierColors = {
  1: { primary: '#CD7F32', secondary: '#E8C19D', accent: '#A05A2C' }, // Bronze
  2: { primary: '#C0C0C0', secondary: '#E6E8E6', accent: '#A9A9A9' }, // Silver
  3: { primary: '#FFD700', secondary: '#FFF8DC', accent: '#DAA520' }, // Gold
  4: { primary: '#B9F2FF', secondary: '#E0FFFF', accent: '#00BFFF' }  // Platinum
};

// Category icons
const categoryIcons = {
  milestone: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  regional: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon">
      <path d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 6V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  special: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon">
      <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 20H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export interface DynamicBadgeProps {
  badge: Badge;
  isEarned?: boolean;
  earnedDate?: Date;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  animate?: boolean;
}

export function DynamicBadge({
  badge,
  isEarned = false,
  earnedDate,
  size = 'md',
  onClick,
  className,
  animate = false
}: DynamicBadgeProps) {
  // Get badge tier colors
  const tierColor = tierColors[badge.tier as keyof typeof tierColors] || tierColors[1];
  
  // Get category icon
  const categoryIcon = categoryIcons[badge.category as keyof typeof categoryIcons] || categoryIcons.milestone;
  
  // Size dimensions
  const dimensions = {
    sm: { size: 80, fontSize: 'text-xs' },
    md: { size: 120, fontSize: 'text-sm' },
    lg: { size: 160, fontSize: 'text-base' }
  };
  
  const { size: badgeSize, fontSize } = dimensions[size];
  
  // Animation variants for the badge when earned
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: 0.2
      }
    }
  };
  
  // Animation for the glow effect
  const glowVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0, 0.5, 0, 0.5, 0],
      scale: [0.8, 1.1, 0.9, 1.05, 1],
      transition: { 
        duration: 2,
        repeat: animate ? Infinity : 0,
        repeatDelay: 5
      }
    }
  };
  
  // Format the earned date
  const formattedDate = earnedDate 
    ? new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(earnedDate instanceof Date ? earnedDate : new Date(earnedDate))
    : null;

  return (
    <motion.div
      className={cn(
        'relative flex flex-col items-center justify-center cursor-pointer group',
        className
      )}
      style={{ width: badgeSize, height: badgeSize }}
      onClick={onClick}
      initial="initial"
      animate="animate"
      variants={badgeVariants}
    >
      {/* Background glow for earned badges */}
      {isEarned && animate && (
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${tierColor.accent}40 0%, transparent 70%)`,
            zIndex: -1
          }}
          variants={glowVariants}
        />
      )}
      
      {/* Badge hexagon shape */}
      <div 
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-300',
          isEarned ? 'opacity-100' : 'opacity-50 grayscale'
        )}
        style={{ 
          width: badgeSize * 0.9, 
          height: badgeSize * 0.9,
          background: `linear-gradient(135deg, ${tierColor.secondary}, ${tierColor.primary})`,
          boxShadow: isEarned ? `0 4px 12px ${tierColor.primary}40` : 'none',
          border: `2px solid ${isEarned ? tierColor.primary : '#666'}`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Category icon */}
          <div 
            className="absolute" 
            style={{ 
              color: isEarned ? tierColor.accent : '#888',
              width: badgeSize * 0.5,
              height: badgeSize * 0.5,
              opacity: 0.25
            }}
          >
            {categoryIcon}
          </div>
          
          {/* Badge lock overlay for unearned badges */}
          {!isEarned && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ width: badgeSize * 0.3, height: badgeSize * 0.3 }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Badge name */}
      <div className={cn(
        'mt-2 font-semibold text-center truncate w-full',
        fontSize
      )}>
        {badge.name}
      </div>
      
      {/* Earned date for earned badges */}
      {isEarned && formattedDate && (
        <div className="text-xs text-muted-foreground mt-1">
          {formattedDate}
        </div>
      )}
    </motion.div>
  );
}