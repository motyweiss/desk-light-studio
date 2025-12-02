import { motion } from "framer-motion";
import { useMemo } from "react";

interface TrendGraphProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  animate?: boolean;
}

export const TrendGraph = ({ 
  data, 
  width = 120, 
  height = 40, 
  color = "hsl(var(--status-comfortable))",
  animate = true 
}: TrendGraphProps) => {
  const pathData = useMemo(() => {
    if (data.length < 2) {
      // Not enough data points, return empty path
      return "";
    }
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });
    
    // Create smooth curve path using quadratic curves
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      path += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
    }
    
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
    
    return path;
  }, [data, width, height]);

  // Guard: don't render if not enough data
  if (data.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-white/30 text-xs"
        style={{ width, height }}
      >
        Loading data...
      </div>
    );
  }

  const totalLength = useMemo(() => {
    if (!pathData) return 0;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    return path.getTotalLength();
  }, [pathData]);

  return (
    <svg 
      width={width} 
      height={height} 
      className="overflow-visible"
      style={{ minWidth: width, minHeight: height }}
    >
      {/* Main trend line */}
      <motion.path
        d={pathData}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ 
          pathLength: 0,
          opacity: 0
        }}
        animate={{ 
          pathLength: animate ? 1 : 0,
          opacity: animate ? 1 : 0
        }}
        transition={{
          pathLength: {
            duration: 1.5,
            ease: [0.25, 0.1, 0.25, 1]
          },
          opacity: {
            duration: 0.5,
            ease: "easeOut"
          }
        }}
      />

    </svg>
  );
};
