import { motion, AnimatePresence } from "framer-motion";
import officeChairIcon from "@/assets/office-chair.svg";
import { TIMING, EASE, PAGE_TRANSITIONS } from "@/lib/animations/tokens";

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
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: PAGE_TRANSITIONS.overlay.scale }}
          transition={{ 
            duration: PAGE_TRANSITIONS.overlay.duration,
            ease: PAGE_TRANSITIONS.overlay.ease
          }}
          style={{
            willChange: 'opacity, transform',
            transformOrigin: 'center center',
          }}
        >
          {/* Minimalist spinner */}
          <motion.div 
            className="relative w-32 h-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: TIMING.fast,
              ease: EASE.entrance
            }}
          >
            {/* Rotating circle with gap */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid transparent',
                borderTopColor: 'hsl(var(--foreground) / 0.8)',
                borderRightColor: 'hsl(var(--foreground) / 0.5)',
                willChange: 'transform',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Inner subtle glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(var(--foreground) / 0.15) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: EASE.smooth,
              }}
            />

            {/* Office Chair Icon in center */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{
                duration: TIMING.fast,
                delay: 0.1,
                ease: EASE.entrance
              }}
            >
              <img 
                src={officeChairIcon}
                alt="Office Chair"
                className="w-14 h-14 brightness-0 invert opacity-90"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
