import React from 'react';

interface MagicMouseIconProps {
  className?: string;
  strokeWidth?: number;
}

export const MagicMouseIcon: React.FC<MagicMouseIconProps> = ({ 
  className = "w-6 h-6", 
  strokeWidth = 1.5 
}) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mouse body - pill shape */}
      <rect 
        x="6" 
        y="3" 
        width="12" 
        height="18" 
        rx="6" 
        stroke="currentColor" 
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Touch surface divider */}
      <line 
        x1="12" 
        y1="3" 
        x2="12" 
        y2="10" 
        stroke="currentColor" 
        strokeWidth={strokeWidth * 0.75}
        strokeLinecap="round"
      />
    </svg>
  );
};
