import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  glowIntensity?: number;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, glowIntensity, ...props }, ref) => {
  const currentValue = value?.[0] ?? 0;
  const intensity = currentValue / 100;
  
  // Dynamic glow based on value
  const thumbGlow = intensity > 0.3 
    ? `0 0 ${12 * intensity}px rgba(221, 175, 76, ${0.4 * intensity}), 0 2px 10px rgba(0,0,0,0.25)`
    : '0 2px 10px rgba(0,0,0,0.25)';

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
            className="absolute h-full rounded-full"
            initial={false}
            animate={{
              opacity: currentValue > 0 ? 1 : 0,
              background: `linear-gradient(90deg, hsl(44 85% ${48 + intensity * 12}%), hsl(44 85% ${55 + intensity * 10}%))`,
            }}
            transition={{
              opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              background: { duration: 0.15 },
            }}
          />
        </SliderPrimitive.Range>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb asChild>
        <motion.span
          className="block h-5 w-5 rounded-full bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
          initial={false}
          animate={{
            scale: 1,
            boxShadow: thumbGlow,
          }}
          whileHover={{ 
            scale: 1.12,
            boxShadow: `0 0 ${16 * Math.max(intensity, 0.3)}px rgba(221, 175, 76, ${0.5 * Math.max(intensity, 0.3)}), 0 4px 16px rgba(0,0,0,0.2)`,
          }}
          whileTap={{ 
            scale: 1.05,
            boxShadow: `0 0 ${20 * Math.max(intensity, 0.4)}px rgba(221, 175, 76, ${0.6 * Math.max(intensity, 0.4)}), 0 4px 20px rgba(0,0,0,0.25)`,
          }}
          transition={{
            scale: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
            boxShadow: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
          }}
        />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
