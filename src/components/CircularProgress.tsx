import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  max: number;
  min?: number;
  size: number;
  strokeWidth?: number;
  children: React.ReactNode;
  isLoaded?: boolean;
  colorType?: 'temperature' | 'humidity' | 'airQuality' | 'default';
}

export const CircularProgress = ({ 
  value, 
  max, 
  min = 0, 
  size, 
  strokeWidth = 2, 
  children,
  isLoaded = true,
  colorType = 'default'
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const offset = circumference * (1 - percentage);
  
  const getProgressColor = (val: number, type: string): string => {
    switch (type) {
      case 'temperature':
        if (val >= 20 && val <= 26) return 'hsl(142 70% 45%)';  // Green - comfortable
        if (val >= 17 && val < 20) return 'hsl(45 90% 55%)';   // Yellow - cool
        if (val > 26 && val <= 30) return 'hsl(35 90% 55%)';   // Orange - warm
        return 'hsl(0 75% 55%)';                                // Red - cold/hot
        
      case 'humidity':
        if (val >= 40 && val <= 60) return 'hsl(142 70% 45%)'; // Green - optimal
        if ((val >= 30 && val < 40) || (val > 60 && val <= 70)) 
          return 'hsl(45 90% 55%)';                             // Yellow - acceptable
        return 'hsl(0 75% 55%)';                                // Red - poor
        
      case 'airQuality':
        if (val <= 12) return 'hsl(142 70% 45%)';              // Green - good
        if (val <= 35) return 'hsl(45 90% 55%)';               // Yellow - moderate
        if (val <= 55) return 'hsl(25 90% 55%)';               // Orange - unhealthy sensitive
        return 'hsl(0 75% 55%)';                                // Red - unhealthy
        
      default:
        return 'hsl(44 85% 58%)';                               // Default warm amber
    }
  };
  
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
          initial={{ 
            strokeDashoffset: circumference,
            stroke: getProgressColor(value, colorType)
          }}
          animate={{ 
            strokeDashoffset: isLoaded ? offset : circumference,
            stroke: getProgressColor(value, colorType)
          }}
          style={{ strokeDasharray: circumference }}
          transition={{ 
            duration: isLoaded ? 1.5 : 2,
            delay: isLoaded ? 0 : 0.5,
            ease: [0.22, 0.03, 0.26, 1] 
          }}
        />
      </svg>
      {/* Icon container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
