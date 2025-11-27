import { motion } from "framer-motion";
import { Settings } from "lucide-react";

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="hidden md:flex fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center text-foreground hover:bg-white/15 hover:border-white/30 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Settings className="w-5 h-5" />
    </motion.button>
  );
};
