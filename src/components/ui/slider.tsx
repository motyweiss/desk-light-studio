import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center group", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
      <SliderPrimitive.Range 
        className="absolute h-full transition-all duration-150 ease-out"
        style={{
          background: 'linear-gradient(90deg, hsl(44 92% 52%), hsl(44 92% 62%))',
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-all duration-200 ease-out hover:scale-[1.15] hover:shadow-[0_4px_16px_rgba(221,175,76,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing active:scale-105 active:shadow-[0_4px_20px_rgba(221,175,76,0.5)] animate-in fade-in-0 zoom-in-50 duration-300" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
