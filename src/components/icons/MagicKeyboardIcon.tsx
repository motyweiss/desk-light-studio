import React from 'react';

interface MagicKeyboardIconProps {
  className?: string;
  strokeWidth?: number;
}

export const MagicKeyboardIcon: React.FC<MagicKeyboardIconProps> = ({ 
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
      {/* Keyboard body */}
      <rect 
        x="2" 
        y="7" 
        width="20" 
        height="10" 
        rx="2" 
        stroke="currentColor" 
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Keys row 1 */}
      <line x1="5" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="8" y1="10" x2="9" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="11" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="15" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="18" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Spacebar */}
      <line x1="7" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
};
