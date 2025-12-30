import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  animateIn?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, animateIn = false, ...props }, ref) => {
  const currentValue = value?.[0] ?? 0;
  const intensity = currentValue / 100;
  const [hasAnimatedIn, setHasAnimatedIn] = React.useState(!animateIn);
  
  // Track if this is the first render for entrance animation
  React.useEffect(() => {
    if (animateIn && !hasAnimatedIn) {
      const timer = setTimeout(() => setHasAnimatedIn(true), 50);
      return () => clearTimeout(timer);
    }
  }, [animateIn, hasAnimatedIn]);
  
  // Dynamic glow based on value
  const thumbGlow = intensity > 0.3 
    ? `0 0 ${12 * intensity}px rgba(221, 175, 76, ${0.4 * intensity}), 0 2px 10px rgba(0,0,0,0.25)`
    : '0 2px 10px rgba(0,0,0,0.25)';

  // Calculate gradient colors based on intensity
  const gradientStart = `hsl(44 85% ${48 + intensity * 12}%)`;
  const gradientEnd = `hsl(44 85% ${55 + intensity * 10}%)`;

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      className={cn("relative flex w-full touch-pan-y select-none items-center group", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/[0.08] cursor-pointer">
        <SliderPrimitive.Range asChild>
          <motion.span
            className="absolute h-full rounded-full origin-left"
            style={{
              background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`,
            }}
            initial={animateIn ? { scaleX: 0, opacity: 0 } : false}
            animate={{ 
              scaleX: currentValue > 0 ? 1 : 0, 
              opacity: currentValue > 0 ? 1 : 0,
            }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{
              scaleX: { 
                duration: 0.4,
                ease: [0.22, 0.68, 0.35, 1.0],
                delay: currentValue > 0 ? 0 : 0.1, // Delay shrink on turn-off (after thumb)
              },
              opacity: { 
                duration: 0.2,
                delay: currentValue > 0 ? 0 : 0.08,
              },
            }}
          />
        </SliderPrimitive.Range>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb asChild>
        <motion.span
          className="block h-5 w-5 rounded-full bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
          initial={animateIn ? { scale: 0, opacity: 0 } : false}
          animate={{
            scale: currentValue > 0 ? 1 : 0,
            opacity: currentValue > 0 ? 1 : 0,
            boxShadow: thumbGlow,
          }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ 
            scale: 1.12,
            boxShadow: `0 0 ${16 * Math.max(intensity, 0.3)}px rgba(221, 175, 76, ${0.5 * Math.max(intensity, 0.3)}), 0 4px 16px rgba(0,0,0,0.2)`,
          }}
          whileTap={{ 
            scale: 1.05,
            boxShadow: `0 0 ${20 * Math.max(intensity, 0.4)}px rgba(221, 175, 76, ${0.6 * Math.max(intensity, 0.4)}), 0 4px 20px rgba(0,0,0,0.25)`,
          }}
          transition={{
            scale: { 
              duration: currentValue > 0 ? 0.35 : 0.25, 
              ease: [0.22, 0.68, 0.35, 1.0],
              delay: animateIn && !hasAnimatedIn && currentValue > 0 ? 0.1 : 0, // Delay on enter only
            },
            opacity: { 
              duration: currentValue > 0 ? 0.25 : 0.15,
              delay: animateIn && !hasAnimatedIn && currentValue > 0 ? 0.08 : 0,
            },
            boxShadow: { duration: 0.15 },
          }}
        />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
