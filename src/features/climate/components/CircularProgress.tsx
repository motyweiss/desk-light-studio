import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DATA_TRANSITION } from "@/constants/animations";

interface CircularProgressProps {
  value: number;
  max: number;
  min?: number;
  size: number;
  strokeWidth?: number;
  children: React.ReactNode;
  isLoaded?: boolean;
  showSkeleton?: boolean;
  colorType?: 'temperature' | 'humidity' | 'airQuality' | 'battery' | 'default';
  delay?: number;
}

export const CircularProgress = ({ 
  value, 
  max, 
  min = 0, 
  size, 
  strokeWidth = 2, 
  children,
  isLoaded = true,
  showSkeleton = false,
  colorType = 'default',
  delay = 0.3
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const offset = circumference * (1 - percentage);
  
  const getProgressColor = (val: number, type: string): string => {
    switch (type) {
      case 'temperature':
        if (val <= 18) return 'hsl(210 80% 55%)';
        if (val <= 20) return 'hsl(190 70% 50%)';
        if (val <= 22) return 'hsl(160 60% 48%)';
        if (val <= 24) return 'hsl(45 80% 55%)';
        if (val <= 26) return 'hsl(30 85% 55%)';
        if (val <= 28) return 'hsl(15 85% 55%)';
        return 'hsl(0 80% 55%)';
        
      case 'humidity':
        if (val >= 40 && val <= 60) return 'hsl(var(--status-optimal))';
        if ((val >= 30 && val < 40) || (val > 60 && val <= 70)) 
          return 'hsl(var(--status-caution))';
        return 'hsl(var(--status-danger))';
        
      case 'airQuality':
        if (val <= 12) return 'hsl(var(--status-comfortable))';
        if (val <= 35) return 'hsl(var(--status-caution))';
        if (val <= 55) return 'hsl(var(--status-warning))';
        return 'hsl(var(--status-danger))';
        
      case 'battery':
        if (val >= 50) return 'hsl(var(--status-comfortable))';
        if (val >= 20) return 'hsl(var(--status-caution))';
        return 'hsl(var(--status-danger))';
        
      default:
        return 'hsl(var(--warm-glow))';
    }
  };

  // Skeleton state - gray pulsing ring
  if (showSkeleton) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          {/* Background ring */}
          <circle
            cx={size/2} 
            cy={size/2} 
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Skeleton shimmer ring */}
          <motion.circle
            cx={size/2} 
            cy={size/2} 
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            style={{ 
              strokeDasharray: circumference,
              strokeDashoffset: circumference * 0.7,
              stroke: 'rgba(255,255,255,0.15)',
            }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 360],
            }}
            transition={{ 
              opacity: {
                duration: DATA_TRANSITION.skeleton.shimmerDuration,
                repeat: Infinity,
                ease: DATA_TRANSITION.skeleton.pulseEase,
              },
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }
            }}
          />
        </svg>
        {/* Icon container with pulse */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: DATA_TRANSITION.skeleton.shimmerDuration,
            repeat: Infinity,
            ease: DATA_TRANSITION.skeleton.pulseEase,
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={size/2} 
          cy={size/2} 
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring with animation */}
        <motion.circle
          cx={size/2} 
          cy={size/2} 
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={false}
          animate={{ 
            strokeDashoffset: isLoaded ? offset : circumference,
            stroke: getProgressColor(value, colorType),
          }}
          style={{ 
            strokeDasharray: circumference,
            willChange: 'stroke-dashoffset, stroke',
          }}
          transition={{ 
            strokeDashoffset: {
              duration: DATA_TRANSITION.reveal.duration,
              delay: isLoaded ? delay : 0,
              ease: DATA_TRANSITION.reveal.ease,
            },
            stroke: {
              duration: 0.5,
              ease: 'easeInOut'
            }
          }}
        />
      </svg>
      {/* Icon container */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ opacity: isLoaded ? 1 : 0.5 }}
        transition={{ duration: DATA_TRANSITION.fadeIn.duration }}
      >
        {children}
      </motion.div>
    </div>
  );
};
