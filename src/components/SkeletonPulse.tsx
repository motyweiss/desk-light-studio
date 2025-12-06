import { motion } from "framer-motion";
import { DATA_TRANSITION } from "@/constants/animations";

interface SkeletonPulseProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable skeleton shimmer animation component
 */
export const SkeletonPulse = ({ className = "", children }: SkeletonPulseProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: DATA_TRANSITION.skeleton.shimmerDuration,
          repeat: Infinity,
          ease: DATA_TRANSITION.skeleton.pulseEase,
        }}
      />
    </div>
  );
};

interface SkeletonTextProps {
  width?: string;
  height?: string;
  className?: string;
}

export const SkeletonText = ({ width = "w-24", height = "h-4", className = "" }: SkeletonTextProps) => {
  return (
    <motion.div
      className={`${width} ${height} bg-white/8 rounded ${className}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{
        duration: DATA_TRANSITION.skeleton.shimmerDuration,
        repeat: Infinity,
        ease: DATA_TRANSITION.skeleton.pulseEase,
      }}
    />
  );
};

interface SkeletonCircleProps {
  size?: number;
  className?: string;
}

export const SkeletonCircle = ({ size = 44, className = "" }: SkeletonCircleProps) => {
  return (
    <motion.div
      className={`rounded-full bg-white/8 ${className}`}
      style={{ width: size, height: size }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{
        duration: DATA_TRANSITION.skeleton.shimmerDuration,
        repeat: Infinity,
        ease: DATA_TRANSITION.skeleton.pulseEase,
      }}
    />
  );
};
