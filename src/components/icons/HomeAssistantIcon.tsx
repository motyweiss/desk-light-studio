import { motion } from "framer-motion";

interface HomeAssistantIconProps {
  className?: string;
  animated?: boolean;
  animationDelay?: number;
}

export const HomeAssistantIcon = ({ 
  className = "w-6 h-6", 
  animated = false,
  animationDelay = 0 
}: HomeAssistantIconProps) => {
  if (!animated) {
    return (
      <svg 
        viewBox="0 0 240 240" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M240 224.762C240 233.012 233.25 239.762 225 239.762H15C6.75 239.762 0 233.012 0 224.762V134.762C0 126.512 4.77 114.993 10.61 109.153L109.39 10.3725C115.22 4.5425 124.77 4.5425 130.6 10.3725L229.39 109.162C235.22 114.992 240 126.522 240 134.772V224.772V224.762Z" fill="currentColor" fillOpacity="0.15"/>
        <path d="M229.39 109.153L130.61 10.3725C124.78 4.5425 115.23 4.5425 109.4 10.3725L10.61 109.153C4.78 114.983 0 126.512 0 134.762V224.762C0 233.012 6.75 239.762 15 239.762H107.27L66.64 199.132C64.55 199.852 62.32 200.262 60 200.262C48.7 200.262 39.5 191.062 39.5 179.762C39.5 168.462 48.7 159.262 60 159.262C71.3 159.262 80.5 168.462 80.5 179.762C80.5 182.092 80.09 184.322 79.37 186.412L111 218.042V102.162C104.2 98.8225 99.5 91.8425 99.5 83.7725C99.5 72.4725 108.7 63.2725 120 63.2725C131.3 63.2725 140.5 72.4725 140.5 83.7725C140.5 91.8425 135.8 98.8225 129 102.162V183.432L160.46 151.972C159.84 150.012 159.5 147.932 159.5 145.772C159.5 134.472 168.7 125.272 180 125.272C191.3 125.272 200.5 134.472 200.5 145.772C200.5 157.072 191.3 166.272 180 166.272C177.5 166.272 175.12 165.802 172.91 164.982L129 208.892V239.772H225C233.25 239.772 240 233.022 240 224.772V134.772C240 126.522 235.23 115.002 229.39 109.162V109.153Z" fill="currentColor"/>
      </svg>
    );
  }

  // Animation timing
  const d = animationDelay;
  const ease = "easeOut" as const;
  
  // Stagger delays for each element
  const timing = {
    houseOutline: d,
    houseFill: d + 1.0,
    topDot: d + 0.4,
    centerLine: d + 0.7,
    leftDot: d + 1.0,
    leftLine: d + 1.3,
    rightDot: d + 1.0,
    rightLine: d + 1.3,
    bottomLine: d + 1.6,
    finalFill: d + 2.0,
  };

  return (
    <svg 
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ===== HOUSE OUTLINE ===== */}
      <motion.path 
        d="M240 224.762C240 233.012 233.25 239.762 225 239.762H15C6.75 239.762 0 233.012 0 224.762V134.762C0 126.512 4.77 114.993 10.61 109.153L109.39 10.3725C115.22 4.5425 124.77 4.5425 130.6 10.3725L229.39 109.162C235.22 114.992 240 126.522 240 134.772V224.772V224.762Z" 
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.houseOutline, duration: 1.2, ease },
          opacity: { delay: timing.houseOutline, duration: 0.2 },
        }}
      />
      
      {/* House fill */}
      <motion.path 
        d="M240 224.762C240 233.012 233.25 239.762 225 239.762H15C6.75 239.762 0 233.012 0 224.762V134.762C0 126.512 4.77 114.993 10.61 109.153L109.39 10.3725C115.22 4.5425 124.77 4.5425 130.6 10.3725L229.39 109.162C235.22 114.992 240 126.522 240 134.772V224.772V224.762Z" 
        fill="currentColor"
        initial={{ fillOpacity: 0 }}
        animate={{ fillOpacity: 0.12 }}
        transition={{ delay: timing.houseFill, duration: 0.5, ease }}
      />

      {/* ===== TOP DOT (center top) ===== */}
      <motion.circle
        cx="120"
        cy="83.77"
        r="20.5"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.topDot, duration: 0.5, ease },
          opacity: { delay: timing.topDot, duration: 0.15 },
        }}
      />
      <motion.circle
        cx="120"
        cy="83.77"
        r="20.5"
        fill="currentColor"
        initial={{ fillOpacity: 0, scale: 0.5 }}
        animate={{ fillOpacity: 1, scale: 1 }}
        transition={{ delay: timing.topDot + 0.4, duration: 0.3, ease }}
      />

      {/* ===== CENTER VERTICAL LINE (from top dot down) ===== */}
      <motion.line
        x1="120"
        y1="104"
        x2="120"
        y2="183"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.centerLine, duration: 0.6, ease },
          opacity: { delay: timing.centerLine, duration: 0.15 },
        }}
      />

      {/* ===== LEFT DOT (bottom left) ===== */}
      <motion.circle
        cx="60"
        cy="179.76"
        r="20.5"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.leftDot, duration: 0.5, ease },
          opacity: { delay: timing.leftDot, duration: 0.15 },
        }}
      />
      <motion.circle
        cx="60"
        cy="179.76"
        r="20.5"
        fill="currentColor"
        initial={{ fillOpacity: 0, scale: 0.5 }}
        animate={{ fillOpacity: 1, scale: 1 }}
        transition={{ delay: timing.leftDot + 0.4, duration: 0.3, ease }}
      />

      {/* ===== LINE TO LEFT DOT ===== */}
      <motion.path
        d="M111 218 L79.37 186.41"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.leftLine, duration: 0.4, ease },
          opacity: { delay: timing.leftLine, duration: 0.15 },
        }}
      />

      {/* ===== RIGHT DOT (middle right) ===== */}
      <motion.circle
        cx="180"
        cy="145.77"
        r="20.5"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.rightDot, duration: 0.5, ease },
          opacity: { delay: timing.rightDot, duration: 0.15 },
        }}
      />
      <motion.circle
        cx="180"
        cy="145.77"
        r="20.5"
        fill="currentColor"
        initial={{ fillOpacity: 0, scale: 0.5 }}
        animate={{ fillOpacity: 1, scale: 1 }}
        transition={{ delay: timing.rightDot + 0.4, duration: 0.3, ease }}
      />

      {/* ===== LINE TO RIGHT DOT ===== */}
      <motion.path
        d="M129 183.43 L160.46 151.97"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.rightLine, duration: 0.4, ease },
          opacity: { delay: timing.rightLine, duration: 0.15 },
        }}
      />

      {/* ===== BOTTOM VERTICAL LINE (to bottom) ===== */}
      <motion.line
        x1="120"
        y1="208"
        x2="120"
        y2="240"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.bottomLine, duration: 0.3, ease },
          opacity: { delay: timing.bottomLine, duration: 0.15 },
        }}
      />

      {/* ===== HOUSE WALLS (left and right sides with bottom) ===== */}
      <motion.path
        d="M229.39 109.153 L130.61 10.3725 C124.78 4.5425 115.23 4.5425 109.4 10.3725 L10.61 109.153 C4.78 114.983 0 126.512 0 134.762 V224.762 C0 233.012 6.75 239.762 15 239.762 H107.27"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.houseOutline + 0.3, duration: 1.5, ease },
          opacity: { delay: timing.houseOutline + 0.3, duration: 0.2 },
        }}
      />

      {/* Right side of house */}
      <motion.path
        d="M129 239.772 H225 C233.25 239.772 240 233.022 240 224.772 V134.772"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: timing.bottomLine + 0.2, duration: 0.8, ease },
          opacity: { delay: timing.bottomLine + 0.2, duration: 0.15 },
        }}
      />
    </svg>
  );
};
