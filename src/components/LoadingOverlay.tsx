import { motion, AnimatePresence } from "framer-motion";
import officeChairIcon from "@/assets/office-chair.svg";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay = ({ isLoading }: LoadingOverlayProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.03, 0.26, 1] }}
          style={{
            backgroundColor: 'hsl(28 20% 18%)',
          }}
        >
          {/* Minimalist spinner - larger with white color */}
          <motion.div className="relative w-20 h-20">
            {/* Rotating circle with gap - white */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '2.5px solid transparent',
                borderTopColor: 'rgba(255, 255, 255, 0.7)',
                borderRightColor: 'rgba(255, 255, 255, 0.4)',
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
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Office Chair Icon in center with fade-in animation */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1
              }}
              exit={{ 
                scale: 0.8, 
                opacity: 0
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 0.03, 0.26, 1],
                delay: 0.2
              }}
            >
              <img 
                src={officeChairIcon}
                alt="Office Chair"
                className="w-7 h-7 opacity-80"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
