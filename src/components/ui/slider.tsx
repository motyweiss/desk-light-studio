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
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/10 backdrop-blur-sm border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[hsl(38_65%_50%/0.85)] to-[hsl(42_60%_55%/0.9)] shadow-[0_0_10px_rgba(200,160,80,0.35)] transition-shadow duration-300" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_0_8px_rgba(200,160,80,0.25),0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-white/50 hover:scale-110 hover:shadow-[0_0_12px_rgba(200,160,80,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
