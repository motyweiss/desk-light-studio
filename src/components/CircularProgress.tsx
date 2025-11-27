import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  max: number;
  min?: number;
  size: number;
  strokeWidth?: number;
  children: React.ReactNode;
  isLoaded?: boolean;
}

export const CircularProgress = ({ 
  value, 
  max, 
  min = 0, 
  size, 
  strokeWidth = 2, 
  children,
  isLoaded = true 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const offset = circumference * (1 - percentage);
  
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
          stroke="hsl(44 85% 58%)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: isLoaded ? offset : circumference 
          }}
          style={{ strokeDasharray: circumference }}
          transition={{ 
            duration: 2, 
            delay: 0.5, 
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
