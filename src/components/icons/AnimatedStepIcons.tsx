import { motion } from "framer-motion";
import { Plug, KeyRound, Lamp, Sparkles } from "lucide-react";

interface AnimatedIconProps {
  className?: string;
  delay?: number;
}

// Plug icon for connection step
export const AnimatedPlugIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Plug className={className} strokeWidth={1} />
    </motion.div>
  );
};

// Key icon for authentication step
export const AnimatedKeyIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <KeyRound className={className} strokeWidth={1} />
    </motion.div>
  );
};

// Lamp icon for devices step
export const AnimatedLampIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Lamp className={className} strokeWidth={1} />
    </motion.div>
  );
};

// Sparkles icon for sync step
export const AnimatedSparklesIcon = ({ className = "w-12 h-12", delay = 0 }: AnimatedIconProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Sparkles className={className} strokeWidth={1} />
    </motion.div>
  );
};
