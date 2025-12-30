import { motion, AnimatePresence } from "framer-motion";
import officeChairIcon from "@/assets/office-chair.svg";
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
          {/* Spinner container */}
          <div className="relative w-24 h-24">
            {/* Outer ring - slow rotation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.15) 25%, transparent 50%)',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Middle ring - faster counter-rotation */}
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{
                background: 'conic-gradient(from 180deg, transparent 0%, rgba(255,255,255,0.25) 30%, transparent 60%)',
              }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Inner breathing glow */}
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.img 
                src={officeChairIcon}
                alt=""
                className="w-10 h-10"
                style={{ filter: 'brightness(0) invert(1)' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.6, 0.9, 0.6],
                  scale: 1,
                }}
                transition={{ 
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.3, delay: 0.1 },
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
