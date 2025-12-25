import React from "react";
import { motion } from "framer-motion";
import { DATA_TRANSITION, EASING } from "@/constants/animations";

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
  duration: DATA_TRANSITION.dataEnter.duration,
  ease: EASING.smooth,
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
  delay = 0.2
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const offset = circumference * (1 - percentage);
  
  const getProgressColor = (): string => {
    // All indicators use white
    return 'rgba(255, 255, 255, 0.5)';
  };

  const isShowingSkeleton = showSkeleton || !isLoaded;

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
          initial={false}
          animate={{ 
            opacity: isShowingSkeleton ? [0.3, 0.6, 0.3] : 0,
            rotate: isShowingSkeleton ? [0, 360] : 0,
          }}
          transition={isShowingSkeleton ? { 
            opacity: {
              duration: DATA_TRANSITION.skeleton.shimmerDuration,
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
        
        {/* Progress ring */}
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
            stroke: getProgressColor(),
            opacity: isShowingSkeleton ? 0 : 1,
          }}
          transition={{ 
            strokeDashoffset: {
              duration: 0.6,
              delay: isShowingSkeleton ? 0 : delay,
              ease: EASING.entrance,
            },
            stroke: {
              duration: 0.5,
              ease: 'easeInOut'
            },
            opacity: smoothTransition
          }}
        />
      </svg>
      
      {/* Icon container */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ 
          opacity: isShowingSkeleton ? [0.4, 0.7, 0.4] : 1,
          filter: isShowingSkeleton ? `blur(${DATA_TRANSITION.dataEnter.blur / 2}px)` : 'blur(0px)',
        }}
        transition={isShowingSkeleton ? {
          opacity: {
            duration: DATA_TRANSITION.skeleton.shimmerDuration,
            repeat: Infinity,
            ease: "easeInOut",
          },
          filter: { duration: 0.1 }
        } : {
          ...smoothTransition,
          filter: { duration: 0.35, ease: EASING.smooth }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
