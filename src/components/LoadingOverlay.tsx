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
          <div className="relative w-28 h-28">
            {/* Single rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '2px solid transparent',
                borderTopColor: 'rgba(255, 255, 255, 0.7)',
                borderRightColor: 'rgba(255, 255, 255, 0.3)',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Center glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.img 
                src={officeChairIcon}
                alt=""
                className="w-12 h-12"
                style={{ filter: 'brightness(0) invert(1)' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
