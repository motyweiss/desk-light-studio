import { motion } from "framer-motion";
import { Plug, KeyRound, Lamp, Sparkles } from "lucide-react";

interface AnimatedIconProps {
  className?: string;
  delay?: number;
}

// Soft, gentle easing
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Plug icon for connection step
export const AnimatedPlugIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.8, ease }}
    >
      <Plug className={className} strokeWidth={1} />
    </motion.div>
  );
};

// Key icon for authentication step
export const AnimatedKeyIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.8, ease }}
    >
      <KeyRound className={className} strokeWidth={1} />
    </motion.div>
  );
};

// Lamp icon for devices step
export const AnimatedLampIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.8, ease }}
    >
      <Lamp className={className} strokeWidth={1} />
    </motion.div>
  );
};

// Sparkles icon for sync step
export const AnimatedSparklesIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.8, ease }}
    >
      <Sparkles className={className} strokeWidth={1} />
    </motion.div>
  );
};
