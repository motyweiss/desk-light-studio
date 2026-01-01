import { motion } from "framer-motion";

interface AnimatedIconProps {
  className?: string;
  delay?: number;
}

const ease = "easeOut" as const;

// Plug icon for connection step - draws prongs, body, cord
export const AnimatedPlugIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
      {/* Left prong */}
      <motion.line
        x1="7" y1="2" x2="7" y2="8"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 0.3, ease }}
      />
      {/* Right prong */}
      <motion.line
        x1="17" y1="2" x2="17" y2="8"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.3, ease }}
      />
      {/* Body */}
      <motion.rect
        x="5" y="8" width="14" height="8" rx="2"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.4, ease }}
      />
      {/* Cord */}
      <motion.path
        d="M12 16 L12 22"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.5, duration: 0.25, ease }}
      />
    </svg>
  );
};

// Key icon for authentication step - draws ring, shaft, teeth
export const AnimatedKeyIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
      {/* Key ring */}
      <motion.circle
        cx="8" cy="8" r="5"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 0.4, ease }}
      />
      {/* Inner circle */}
      <motion.circle
        cx="8" cy="8" r="2"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.25, duration: 0.25, ease }}
      />
      {/* Shaft */}
      <motion.line
        x1="12" y1="12" x2="20" y2="20"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.35, duration: 0.3, ease }}
      />
      {/* Teeth */}
      <motion.path
        d="M16 16 L18 14"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.55, duration: 0.2, ease }}
      />
      <motion.path
        d="M18 18 L20 16"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.65, duration: 0.2, ease }}
      />
    </svg>
  );
};

// Lamp icon for devices step - draws base, stem, shade, rays
export const AnimatedLampIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
      {/* Base */}
      <motion.ellipse
        cx="12" cy="21" rx="4" ry="1.5"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 0.3, ease }}
      />
      {/* Stem */}
      <motion.line
        x1="12" y1="19.5" x2="12" y2="14"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.25, ease }}
      />
      {/* Lamp shade */}
      <motion.path
        d="M6 14 L12 6 L18 14 Z"
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: delay + 0.35, duration: 0.4, ease }}
      />
      {/* Light ray left */}
      <motion.line
        x1="4" y1="10" x2="2" y2="8"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: delay + 0.65, duration: 0.15, ease }}
      />
      {/* Light ray right */}
      <motion.line
        x1="20" y1="10" x2="22" y2="8"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: delay + 0.7, duration: 0.15, ease }}
      />
      {/* Light ray top */}
      <motion.line
        x1="12" y1="3" x2="12" y2="1"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: delay + 0.75, duration: 0.15, ease }}
      />
    </svg>
  );
};

// Sparkles icon for analyzing step - draws stars one by one
export const AnimatedSparklesIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
      {/* Main star */}
      <motion.path
        d="M12 2 L13 8 L19 9 L13 10 L12 16 L11 10 L5 9 L11 8 Z"
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 0.5, ease }}
      />
      {/* Top right small star */}
      <motion.path
        d="M18 3 L18.5 5 L20.5 5.5 L18.5 6 L18 8 L17.5 6 L15.5 5.5 L17.5 5 Z"
        strokeWidth="0.75"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0, scale: 0 }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.4, duration: 0.3, ease }}
      />
      {/* Bottom left small star */}
      <motion.path
        d="M6 16 L6.5 18 L8.5 18.5 L6.5 19 L6 21 L5.5 19 L3.5 18.5 L5.5 18 Z"
        strokeWidth="0.75"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0, scale: 0 }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.55, duration: 0.3, ease }}
      />
      {/* Dot */}
      <motion.circle
        cx="20" cy="14" r="1"
        strokeWidth="0.75"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ delay: delay + 0.7, duration: 0.2, ease }}
      />
    </svg>
  );
};
