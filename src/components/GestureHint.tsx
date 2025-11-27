import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronsLeft, ChevronsRight, Maximize2 } from "lucide-react";

interface GestureHintProps {
  show: boolean;
  onDismiss: () => void;
}

export const GestureHint = ({ show, onDismiss }: GestureHintProps) => {
  const [currentHint, setCurrentHint] = useState(0);

  const hints = [
    {
      icon: <ChevronsLeft className="w-6 h-6" />,
      text: "Swipe left/right to switch lights"
    },
    {
      icon: <Maximize2 className="w-6 h-6" />,
      text: "Pinch to adjust master brightness"
    }
  ];

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % hints.length);
    }, 3000);

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, 9000);

    return () => {
      clearInterval(timer);
      clearTimeout(dismissTimer);
    };
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden"
        >
          <motion.div
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-lg"
            onClick={onDismiss}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHint}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="text-white/70">
                  {hints[currentHint].icon}
                </div>
                <p className="text-white/90 text-sm font-light">
                  {hints[currentHint].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
