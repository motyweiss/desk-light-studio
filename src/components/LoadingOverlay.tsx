import { motion, AnimatePresence } from "framer-motion";
import officeChairIcon from "@/assets/office-chair.svg";
import { PAGE_LOAD, EASING } from "@/constants/animations";

interface LoadingOverlayProps {
  isLoading: boolean;
  onExitComplete?: () => void;
}

export const LoadingOverlay = ({ isLoading, onExitComplete }: LoadingOverlayProps) => {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: PAGE_LOAD.overlay.exitDuration,
            ease: EASING.smooth
          }}
          style={{
            backgroundColor: "#96856e",
            willChange: 'opacity',
          }}
        >
          {/* Minimalist spinner */}
          <motion.div 
            className="relative w-32 h-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.25,
              ease: EASING.entrance
            }}
          >
            {/* Rotating circle with gap */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid transparent',
                borderTopColor: 'rgba(255, 255, 255, 0.8)',
                borderRightColor: 'rgba(255, 255, 255, 0.5)',
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
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Office Chair Icon in center */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{
                duration: 0.25,
                delay: 0.1,
                ease: EASING.entrance
              }}
            >
              <img 
                src={officeChairIcon}
                alt="Office Chair"
                className="w-14 h-14"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
