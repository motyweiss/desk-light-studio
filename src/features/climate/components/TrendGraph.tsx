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
    if (!type) return 'rgba(255, 255, 255, 0.6)';
    
    switch (type) {
      case 'temperature':
        // Blue to red gradient for temperature only
        if (value <= 18) return 'hsl(210 80% 55%)'; // cold - blue
        if (value <= 20) return 'hsl(190 70% 50%)'; // cool - cyan-blue
        if (value <= 22) return 'hsl(160 60% 48%)'; // mild - teal
        if (value <= 24) return 'hsl(45 80% 55%)';  // comfortable - yellow
        if (value <= 26) return 'hsl(30 85% 55%)';  // warm - orange
        if (value <= 28) return 'hsl(15 85% 55%)';  // warmer - red-orange
        return 'hsl(0 80% 55%)'; // hot - red
        
      case 'humidity':
      case 'airQuality':
        // All non-temperature use white
        return 'rgba(255, 255, 255, 0.6)';
        
      default:
        return 'rgba(255, 255, 255, 0.6)';
    }
  };

  const { pathSegments, fullPath } = useMemo(() => {
    if (data.length < 2) {
      return { pathSegments: [], fullPath: '' };
    }
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y, value };
    });
    
    // Create segments for gradient coloring
    const segments: Array<{ path: string; color: string; startX: number; endX: number }> = [];
    
    // Build full smooth path using quadratic curves
    let pathD = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      const avgValue = (current.value + next.value) / 2;
      const segmentColor = getColorForValue(avgValue, colorType);
      
      if (i === 0) {
        pathD += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
      } else {
        pathD += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
      }
      
      segments.push({ 
        path: '', 
        color: segmentColor, 
        startX: current.x, 
        endX: next.x 
      });
    }
    
    // Final segment to last point
    const last = points[points.length - 1];
    pathD += ` L ${last.x} ${last.y}`;
    
    return { pathSegments: segments, fullPath: pathD };
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

  // Create gradient stops based on segment colors
  const gradientStops = pathSegments.map((segment, index) => {
    const offset = (segment.startX / width) * 100;
    return (
      <stop key={index} offset={`${offset}%`} stopColor={segment.color} />
    );
  });
  
  // Add final stop
  if (pathSegments.length > 0) {
    gradientStops.push(
      <stop key="final" offset="100%" stopColor={pathSegments[pathSegments.length - 1].color} />
    );
  }

  const maskId = `trend-mask-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = `trend-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg 
      width={width} 
      height={height} 
      className="overflow-visible"
      style={{ minWidth: width, minHeight: height }}
    >
      <defs>
        {/* Gradient for multi-color line */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops}
        </linearGradient>
        
        {/* Reveal mask - animates from left to right */}
        <mask id={maskId}>
          <motion.rect
            x={0}
            y={0}
            height={height + 4}
            fill="white"
            initial={{ width: 0 }}
            animate={{ width: animate ? width + 4 : 0 }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.2
            }}
          />
        </mask>
      </defs>
      
      {/* Single path with gradient stroke, revealed by mask */}
      <path
        d={fullPath}
        stroke={`url(#${gradientId})`}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};
