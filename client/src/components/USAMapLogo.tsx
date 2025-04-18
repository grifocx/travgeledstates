import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface USAMapLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function USAMapLogo({ size = 32, className, animate = false }: USAMapLogoProps) {
  const mapVariants = {
    initial: { scale: 0.9, opacity: 0.7 },
    animate: animate ? {
      scale: [0.9, 1.05, 1],
      opacity: [0.7, 1, 0.9, 1],
      transition: {
        duration: 2,
        times: [0, 0.5, 1],
        repeat: 0
      }
    } : {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      initial="initial"
      animate="animate"
      variants={mapVariants}
    >
      {/* Simplified USA Map Logo */}
      <svg
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Base map shape */}
        <path
          d="M19.5 11.5L12 16.5L8.5 23L5 33L8.5 38L15 41.5L19.5 44.5L28 45L34 42L38.5 39L43.5 37.5L47 35.5L52 29.5L58.5 27.5L64.5 28L70 30L73 32L77.5 33.5L83 32L89 27.5L93 22L95 15L92.5 10L88 6.5L83 5L77.5 5.5L72 7.5L66 8.5L60 7.5L55 9L49.5 12.5L44.5 13.5L39 12L34 9L29.5 8.5L24.5 9.5L19.5 11.5Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Alaska */}
        <path
          d="M15 48.5L8 52L4 54.5L7 55.5L12 54L16 52L15 48.5Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        
        {/* Hawaii */}
        <path
          d="M20 54.5L23 55L25 52.5L22.5 51L20 54.5Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        
        {/* Stars for symbolizing visited states */}
        <circle cx="35" cy="20" r="1.5" fill="currentColor" />
        <circle cx="55" cy="15" r="1.5" fill="currentColor" />
        <circle cx="75" cy="25" r="1.5" fill="currentColor" />
        <circle cx="45" cy="30" r="1.5" fill="currentColor" />
        <circle cx="25" cy="30" r="1.5" fill="currentColor" />
      </svg>
    </motion.div>
  );
}

export default USAMapLogo;