import React from "react";
import { motion } from "framer-motion";

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

// Smooth transition config
const smoothTransition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

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

  const isShowingSkeleton = showSkeleton || !isLoaded;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        {/* Background ring - always visible */}
        <circle
          cx={size/2} 
          cy={size/2} 
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Skeleton shimmer ring - crossfade with progress */}
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
          initial={false}
          animate={{ 
            opacity: isShowingSkeleton ? [0.3, 0.6, 0.3] : 0,
            rotate: isShowingSkeleton ? [0, 360] : 0,
          }}
          transition={isShowingSkeleton ? { 
            opacity: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }
          } : smoothTransition}
        />
        
        {/* Progress ring - crossfade in when data ready */}
        <motion.circle
          cx={size/2} 
          cy={size/2} 
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{ 
            strokeDasharray: circumference,
          }}
          initial={false}
          animate={{ 
            strokeDashoffset: isShowingSkeleton ? circumference : offset,
            stroke: getProgressColor(value, colorType),
            opacity: isShowingSkeleton ? 0 : 1,
          }}
          transition={{ 
            strokeDashoffset: {
              duration: 0.6,
              delay: isShowingSkeleton ? 0 : delay,
              ease: smoothTransition.ease,
            },
            stroke: {
              duration: 0.5,
              ease: 'easeInOut'
            },
            opacity: smoothTransition
          }}
        />
      </svg>
      
      {/* Icon container - blur-to-sharp reveal */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ 
          opacity: isShowingSkeleton ? [0.4, 0.7, 0.4] : 1,
          filter: isShowingSkeleton ? 'blur(2px)' : 'blur(0px)',
        }}
        transition={isShowingSkeleton ? {
          opacity: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
          filter: { duration: 0.1 }
        } : {
          ...smoothTransition,
          filter: { duration: 0.4, ease: smoothTransition.ease }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
