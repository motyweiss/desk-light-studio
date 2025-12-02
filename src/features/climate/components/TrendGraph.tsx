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
    if (data.length < 2) return "";
    
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
      {/* Gradient for fill */}
      <defs>
        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Fill area under the curve */}
      <motion.path
        d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
        fill="url(#trendGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: animate ? 1 : 0 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      />

      {/* Main trend line */}
      <motion.path
        d={pathData}
        stroke={color}
        strokeWidth={2}
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
            duration: 1.2,
            ease: [0.22, 0.03, 0.26, 1]
          },
          opacity: {
            duration: 0.3
          }
        }}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
        }}
      />

      {/* Data points */}
      {data.map((value, index) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        
        return (
          <motion.circle
            key={index}
            cx={x}
            cy={y}
            r={2}
            fill={color}
            initial={{ 
              scale: 0,
              opacity: 0
            }}
            animate={{ 
              scale: animate ? 1 : 0,
              opacity: animate ? 0.8 : 0
            }}
            transition={{
              duration: 0.4,
              delay: 0.6 + (index * 0.05),
              ease: [0.34, 1.56, 0.64, 1]
            }}
          />
        );
      })}
    </svg>
  );
};
