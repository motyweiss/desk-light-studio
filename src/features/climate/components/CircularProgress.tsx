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
  /** Gap in the circle (in degrees, starting from bottom) */
  gapAngle?: number;
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
  delay = 0.2,
  gapAngle = 0,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  
  // Calculate arc length considering the gap
  const gapFraction = gapAngle / 360;
  const availableCircumference = circumference * (1 - gapFraction);
  const progressLength = availableCircumference * percentage;
  const remainingLength = availableCircumference - progressLength;
  
  // For gapped circles, we need to offset the start point
  const startOffset = circumference * (gapFraction / 2);
  
  const getProgressColor = (): string => {
    return 'rgba(255, 255, 255, 0.7)';
  };

  const getTrackColor = (): string => {
    return 'rgba(255, 255, 255, 0.08)';
  };

  const isShowingSkeleton = showSkeleton || !isLoaded;

  // Calculate rotation to position gap at bottom center
  const rotationOffset = gapAngle > 0 ? 90 + (gapAngle / 2) : -90;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="absolute inset-0" 
        width={size} 
        height={size}
        style={{ transform: `rotate(${rotationOffset}deg)` }}
      >
        {/* Background ring with gap */}
        <circle
          cx={size/2} 
          cy={size/2} 
          r={radius}
          stroke={getTrackColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: gapAngle > 0 
              ? `${availableCircumference} ${circumference}`
              : circumference,
          }}
        />
        
        {/* Skeleton shimmer ring */}
        {isShowingSkeleton && (
          <motion.circle
            cx={size/2} 
            cy={size/2} 
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            style={{ 
              strokeDasharray: `${availableCircumference * 0.3} ${circumference}`,
              stroke: 'rgba(255,255,255,0.2)',
            }}
            initial={{ rotate: 0 }}
            animate={{ 
              rotate: 360,
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ 
              rotate: {
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              },
              opacity: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          />
        )}
        
        {/* Progress ring */}
        <motion.circle
          cx={size/2} 
          cy={size/2} 
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{ 
            strokeDasharray: `${progressLength} ${remainingLength + (circumference * gapFraction)}`,
          }}
          initial={false}
          animate={{ 
            strokeDasharray: isShowingSkeleton 
              ? `0 ${circumference}` 
              : `${progressLength} ${remainingLength + (circumference * gapFraction)}`,
            stroke: getProgressColor(),
            opacity: isShowingSkeleton ? 0 : 1,
          }}
          transition={{ 
            strokeDasharray: {
              duration: 0.8,
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
          opacity: isShowingSkeleton ? 0.5 : 1,
          scale: isShowingSkeleton ? 0.95 : 1,
        }}
        transition={{
          duration: 0.4,
          delay: isShowingSkeleton ? 0 : delay + 0.1,
          ease: EASING.entrance,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
