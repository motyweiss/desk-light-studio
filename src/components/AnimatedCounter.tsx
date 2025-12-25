import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  isActive?: boolean;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 1.2,
  delay = 0,
  isActive = true,
  suffix = "",
  className = "",
}: AnimatedCounterProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const springValue = useSpring(0, {
    stiffness: 120,
    damping: 14,
    mass: 0.8,
  });
  
  const displayValue = useTransform(springValue, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      setDisplay(latest);
    });
    return () => unsubscribe();
  }, [displayValue]);

  useEffect(() => {
    if (isActive && !hasAnimated) {
      const timer = setTimeout(() => {
        springValue.set(value);
        setHasAnimated(true);
      }, delay * 1000);
      return () => clearTimeout(timer);
    } else if (isActive && hasAnimated) {
      // Update immediately if value changes after initial animation
      springValue.set(value);
    }
  }, [isActive, value, delay, springValue, hasAnimated]);

  return (
    <motion.span className={className}>
      {display}{suffix}
    </motion.span>
  );
};
