import { motion, AnimatePresence } from "framer-motion";
import officeChairIcon from "@/assets/office-chair.svg";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay = ({ isLoading }: LoadingOverlayProps) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.6,
            ease: [0.22, 0.03, 0.26, 1]
          }}
          style={{
            backgroundColor: '#96856e',
          }}
        >
          {/* Minimalist spinner - larger with white color */}
          <motion.div 
            className="relative w-32 h-32"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ 
              duration: 0.5,
              ease: [0.22, 0.03, 0.26, 1]
            }}
          >
            {/* Rotating circle with gap - white */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid transparent',
                borderTopColor: 'rgba(255, 255, 255, 0.8)',
                borderRightColor: 'rgba(255, 255, 255, 0.5)',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Inner subtle glow - white */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Office Chair Icon in center */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{
                duration: 0.4,
                delay: 0.2,
                ease: [0.22, 0.03, 0.26, 1]
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
