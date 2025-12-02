import { motion } from "framer-motion";
import { useMemo } from "react";

interface TrendGraphProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  animate?: boolean;
  colorType?: 'temperature' | 'humidity' | 'airQuality';
}

export const TrendGraph = ({ 
  data, 
  width = 120, 
  height = 40, 
  color = "hsl(var(--status-comfortable))",
  animate = true,
  colorType
}: TrendGraphProps) => {
  
  const getColorForValue = (value: number, type?: string): string => {
    if (!type) return color;
    
    switch (type) {
      case 'temperature':
        if (value <= 17) return 'hsl(200 70% 55%)'; // cold - light blue
        if (value <= 20) return 'hsl(180 60% 50%)'; // cool - cyan
        if (value <= 24) return 'hsl(142 70% 45%)'; // comfortable - green
        if (value <= 28) return 'hsl(35 90% 55%)'; // warm - orange
        return 'hsl(0 75% 55%)'; // hot - red
        
      case 'humidity':
        if (value >= 40 && value <= 60) return 'hsl(142 70% 45%)'; // optimal - green
        if ((value >= 30 && value < 40) || (value > 60 && value <= 70)) 
          return 'hsl(44 85% 58%)'; // caution - yellow
        return 'hsl(0 75% 55%)'; // danger - red
        
      case 'airQuality':
        if (value <= 12) return 'hsl(142 70% 45%)'; // good - green
        if (value <= 35) return 'hsl(44 85% 58%)'; // moderate - yellow
        if (value <= 55) return 'hsl(35 90% 55%)'; // sensitive - orange
        return 'hsl(0 75% 55%)'; // unhealthy - red
        
      default:
        return color;
    }
  };

  const pathSegments = useMemo(() => {
    if (data.length < 2) {
      return [];
    }
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y, value };
    });
    
    // Create segments between each pair of points
    const segments: Array<{ path: string; color: string }> = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      // Use the average value for color determination
      const avgValue = (current.value + next.value) / 2;
      const segmentColor = getColorForValue(avgValue, colorType);
      
      let path: string;
      if (i === 0) {
        // First segment starts with M
        path = `M ${current.x} ${current.y} Q ${current.x} ${current.y}, ${midX} ${midY}`;
      } else {
        // Continue from previous segment
        const prevMidX = (points[i - 1].x + current.x) / 2;
        const prevMidY = (points[i - 1].y + current.y) / 2;
        path = `M ${prevMidX} ${prevMidY} Q ${current.x} ${current.y}, ${midX} ${midY}`;
      }
      
      segments.push({ path, color: segmentColor });
    }
    
    // Add final segment to last point
    const secondLast = points[points.length - 2];
    const last = points[points.length - 1];
    const lastMidX = (secondLast.x + last.x) / 2;
    const lastMidY = (secondLast.y + last.y) / 2;
    const lastColor = getColorForValue(last.value, colorType);
    
    segments.push({
      path: `M ${lastMidX} ${lastMidY} L ${last.x} ${last.y}`,
      color: lastColor
    });
    
    return segments;
  }, [data, width, height, colorType, color]);

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

  return (
    <svg 
      width={width} 
      height={height} 
      className="overflow-visible"
      style={{ minWidth: width, minHeight: height }}
    >
      {/* Render each segment with its own color */}
      {pathSegments.map((segment, index) => (
        <motion.path
          key={index}
          d={segment.path}
          stroke={segment.color}
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
              delay: index * 0.02, // Slight stagger for smooth appearance
              ease: [0.25, 0.1, 0.25, 1]
            },
            opacity: {
              duration: 0.5,
              delay: index * 0.02,
              ease: "easeOut"
            }
          }}
        />
      ))}
    </svg>
  );
};
