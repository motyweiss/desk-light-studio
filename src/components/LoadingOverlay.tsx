import { motion, AnimatePresence } from "framer-motion";
import { LOAD_SEQUENCE } from "@/constants/loadingSequence";

interface LoadingOverlayProps {
  isLoading: boolean;
  onExitComplete?: () => void;
}

export const LoadingOverlay = ({ isLoading, onExitComplete }: LoadingOverlayProps) => {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ 
            opacity: 0, 
            scale: LOAD_SEQUENCE.spinner.exitScale,
            filter: `blur(${LOAD_SEQUENCE.spinner.exitBlur}px)`,
          }}
          transition={{ 
            duration: LOAD_SEQUENCE.spinner.exitDuration,
            ease: LOAD_SEQUENCE.spinner.exitEase,
          }}
        >
          {/* Minimal spinner - single arc */}
          <div className="relative w-12 h-12">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1.5px solid rgba(255, 255, 255, 0.08)',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '1.5px solid transparent',
                borderTopColor: 'rgba(255, 255, 255, 0.5)',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
