import { Plug, KeyRound, Lamp, Sparkles } from "lucide-react";

interface AnimatedIconProps {
  className?: string;
  delay?: number;
}

// Plug icon for connection step
export const AnimatedPlugIcon = ({ className = "w-12 h-12" }: AnimatedIconProps) => {
  return <Plug className={className} strokeWidth={1} />;
};

// Key icon for authentication step
export const AnimatedKeyIcon = ({ className = "w-12 h-12" }: AnimatedIconProps) => {
  return <KeyRound className={className} strokeWidth={1} />;
};

// Lamp icon for devices step
export const AnimatedLampIcon = ({ className = "w-12 h-12" }: AnimatedIconProps) => {
  return <Lamp className={className} strokeWidth={1} />;
};

// Sparkles icon for analyzing step
export const AnimatedSparklesIcon = ({ className = "w-12 h-12" }: AnimatedIconProps) => {
  return <Sparkles className={className} strokeWidth={1} />;
};
