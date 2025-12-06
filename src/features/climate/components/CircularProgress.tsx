import { motion } from "framer-motion";
import { PAGE_LOAD_SEQUENCE } from "@/constants/animations";

interface CircularProgressProps {
  value: number;
  max: number;
  min?: number;
  size: number;
  strokeWidth?: number;
  children: React.ReactNode;
  isLoaded?: boolean;
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
  colorType = 'default',
  delay = PAGE_LOAD_SEQUENCE.circularProgress.delay
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
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isLoaded ? offset : circumference }}
          style={{ 
            strokeDasharray: circumference,
            stroke: getProgressColor(value, colorType),
            willChange: 'stroke-dashoffset',
          }}
          transition={{ 
            strokeDashoffset: {
              duration: PAGE_LOAD_SEQUENCE.circularProgress.duration,
              delay: delay,
              ease: PAGE_LOAD_SEQUENCE.circularProgress.ease
            },
            stroke: {
              duration: 0.5,
              ease: 'easeInOut'
            }
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