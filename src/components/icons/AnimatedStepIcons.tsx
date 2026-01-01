import { motion } from "framer-motion";

interface AnimatedIconProps {
  className?: string;
  delay?: number;
}

const ease = "easeOut" as const;

// Plug icon for connection step
export const AnimatedPlugIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Left prong */}
      <motion.rect
        x="16" y="6" width="4" height="14" rx="2"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay, duration: 0.4, ease }}
      />
      <motion.rect
        x="16" y="6" width="4" height="14" rx="2"
        fill="currentColor"
        initial={{ fillOpacity: 0, scaleY: 0 }}
        animate={{ fillOpacity: 1, scaleY: 1 }}
        style={{ originY: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.3, ease }}
      />
      
      {/* Right prong */}
      <motion.rect
        x="28" y="6" width="4" height="14" rx="2"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.15, duration: 0.4, ease }}
      />
      <motion.rect
        x="28" y="6" width="4" height="14" rx="2"
        fill="currentColor"
        initial={{ fillOpacity: 0, scaleY: 0 }}
        animate={{ fillOpacity: 1, scaleY: 1 }}
        style={{ originY: 0 }}
        transition={{ delay: delay + 0.4, duration: 0.3, ease }}
      />
      
      {/* Body */}
      <motion.rect
        x="12" y="18" width="24" height="16" rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.5, ease }}
      />
      <motion.rect
        x="12" y="18" width="24" height="16" rx="4"
        fill="currentColor"
        fillOpacity="0.15"
        initial={{ fillOpacity: 0 }}
        animate={{ fillOpacity: 0.15 }}
        transition={{ delay: delay + 0.7, duration: 0.3, ease }}
      />
      
      {/* Cord */}
      <motion.path
        d="M24 34 L24 42"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.6, duration: 0.3, ease }}
      />
    </svg>
  );
};

// Key icon for authentication step
export const AnimatedKeyIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Key ring (circle) */}
      <motion.circle
        cx="34" cy="14" r="8"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay, duration: 0.5, ease }}
      />
      <motion.circle
        cx="34" cy="14" r="8"
        fill="currentColor"
        fillOpacity="0.15"
        initial={{ fillOpacity: 0, scale: 0 }}
        animate={{ fillOpacity: 0.15, scale: 1 }}
        transition={{ delay: delay + 0.4, duration: 0.3, ease }}
      />
      
      {/* Key shaft */}
      <motion.path
        d="M28 20 L12 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.35, duration: 0.4, ease }}
      />
      
      {/* Key teeth */}
      <motion.path
        d="M12 36 L12 42 L16 42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.6, duration: 0.25, ease }}
      />
      <motion.path
        d="M16 36 L16 40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.75, duration: 0.2, ease }}
      />
    </svg>
  );
};

// Desk lamp icon for devices step
export const AnimatedLampIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Base */}
      <motion.ellipse
        cx="24" cy="42" rx="10" ry="3"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay, duration: 0.4, ease }}
      />
      <motion.ellipse
        cx="24" cy="42" rx="10" ry="3"
        fill="currentColor"
        fillOpacity="0.15"
        initial={{ fillOpacity: 0 }}
        animate={{ fillOpacity: 0.15 }}
        transition={{ delay: delay + 0.3, duration: 0.3, ease }}
      />
      
      {/* Stem */}
      <motion.path
        d="M24 39 L24 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.25, duration: 0.3, ease }}
      />
      
      {/* Arm */}
      <motion.path
        d="M24 28 L32 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.45, duration: 0.3, ease }}
      />
      
      {/* Lamp head */}
      <motion.path
        d="M26 16 L38 10 L42 18 L30 22 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.6, duration: 0.4, ease }}
      />
      <motion.path
        d="M26 16 L38 10 L42 18 L30 22 Z"
        fill="currentColor"
        fillOpacity="0.2"
        initial={{ fillOpacity: 0 }}
        animate={{ fillOpacity: 0.2 }}
        transition={{ delay: delay + 0.9, duration: 0.3, ease }}
      />
      
      {/* Light rays */}
      <motion.path
        d="M38 24 L40 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: delay + 1, duration: 0.2, ease }}
      />
      <motion.path
        d="M34 26 L34 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: delay + 1.1, duration: 0.2, ease }}
      />
      <motion.path
        d="M42 22 L46 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: delay + 1.2, duration: 0.2, ease }}
      />
    </svg>
  );
};

// Sparkles/magic icon for sync step
export const AnimatedSparklesIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      {/* Center star */}
      <motion.path
        d="M24 6 L26 18 L38 20 L26 22 L24 34 L22 22 L10 20 L22 18 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay, duration: 0.6, ease }}
      />
      <motion.path
        d="M24 6 L26 18 L38 20 L26 22 L24 34 L22 22 L10 20 L22 18 Z"
        fill="currentColor"
        fillOpacity="0.2"
        initial={{ fillOpacity: 0, scale: 0 }}
        animate={{ fillOpacity: 0.2, scale: 1 }}
        transition={{ delay: delay + 0.5, duration: 0.3, ease }}
      />
      
      {/* Top right small star */}
      <motion.path
        d="M36 8 L37 12 L41 13 L37 14 L36 18 L35 14 L31 13 L35 12 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.6, duration: 0.3, ease: "backOut" }}
      />
      
      {/* Bottom left small star */}
      <motion.path
        d="M12 32 L13 36 L17 37 L13 38 L12 42 L11 38 L7 37 L11 36 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.75, duration: 0.3, ease: "backOut" }}
      />
      
      {/* Tiny dots */}
      <motion.circle
        cx="40" cy="28" r="2"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ delay: delay + 0.9, duration: 0.2, ease }}
      />
      <motion.circle
        cx="8" cy="12" r="1.5"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ delay: delay + 1, duration: 0.2, ease }}
      />
    </svg>
  );
};
