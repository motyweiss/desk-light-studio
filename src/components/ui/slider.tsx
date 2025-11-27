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
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[hsl(35_30%_50%)] to-[hsl(36_35%_55%)] shadow-[0_0_10px_rgba(150,130,100,0.35)] transition-shadow duration-300" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white border-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out hover:scale-125 hover:shadow-[0_3px_12px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing active:scale-110 animate-in fade-in-0 zoom-in-50 duration-300" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
