import { motion } from "framer-motion";
import { useMemo, useCallback, useState, useEffect } from "react";
import { TIMING, EASE, DELAY, SEQUENCES } from "@/lib/animations";

interface AmbientGlowLayersProps {
  spotlightIntensity: number;
  deskLampIntensity: number;
  monitorLightIntensity: number;
  allLightsOn: boolean;
  isLoaded?: boolean;
  dataReady?: boolean;
}

export const AmbientGlowLayers = ({
  spotlightIntensity,
  deskLampIntensity,
  monitorLightIntensity,
  allLightsOn,
  isLoaded = true,
  dataReady = true
}: AmbientGlowLayersProps) => {
  // Track if initial animation has completed
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  // Only animate in after content has entered AND data is ready
  useEffect(() => {
    if (isLoaded && dataReady && !hasAnimatedIn) {
      const timer = setTimeout(() => {
        setHasAnimatedIn(true);
      }, DELAY.long * 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, dataReady, hasAnimatedIn]);

  // Only calculate opacities when fully ready
  const spotlightOpacity = useMemo(() => 
    hasAnimatedIn ? Math.pow(spotlightIntensity / 100, 2.2) * 0.5 : 0, 
    [spotlightIntensity, hasAnimatedIn]
  );
  const deskLampOpacity = useMemo(() => 
    hasAnimatedIn ? Math.pow(deskLampIntensity / 100, 2.2) * 0.5 : 0, 
    [deskLampIntensity, hasAnimatedIn]
  );
  const monitorLightOpacity = useMemo(() => 
    hasAnimatedIn ? Math.pow(monitorLightIntensity / 100, 2.2) * 0.5 : 0, 
    [monitorLightIntensity, hasAnimatedIn]
  );

  // Unified animation timing using centralized tokens
  const getDuration = useCallback((targetOpacity: number) => {
    if (!hasAnimatedIn) return TIMING.slow;
    return targetOpacity > 0 ? SEQUENCES.lightControl.turnOnDuration : SEQUENCES.lightControl.turnOffDuration;
  }, [hasAnimatedIn]);

  const getEasing = useCallback((targetOpacity: number) => {
    if (!hasAnimatedIn) return EASE.smooth;
    return targetOpacity > 0 ? EASE.entrance : EASE.out;
  }, [hasAnimatedIn]);

  // Don't render until loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {/* Spotlight ambient glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 35%, hsl(var(--glow-warm-orange) / 0.12) 0%, hsl(var(--glow-base) / 0.06) 30%, transparent 60%)`,
          filter: 'blur(90px)',
          willChange: 'opacity',
        }}
        initial={false}
        animate={{ opacity: spotlightOpacity }}
        transition={{
          duration: getDuration(spotlightOpacity),
          delay: hasAnimatedIn ? 0.05 : 0,
          ease: getEasing(spotlightOpacity)
        }}
      />
      
      {/* Desk lamp ambient glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 30% 55%, hsl(var(--glow-warm-gold) / 0.11) 0%, hsl(var(--glow-warm-orange) / 0.05) 35%, transparent 58%)`,
          filter: 'blur(85px)',
          willChange: 'opacity',
        }}
        initial={false}
        animate={{ opacity: deskLampOpacity }}
        transition={{
          duration: getDuration(deskLampOpacity),
          delay: hasAnimatedIn ? 0.05 : 0,
          ease: getEasing(deskLampOpacity)
        }}
      />
      
      {/* Monitor light ambient glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 40%, hsl(var(--glow-warm-cream) / 0.10) 0%, hsl(var(--glow-base) / 0.04) 38%, transparent 62%)`,
          filter: 'blur(80px)',
          willChange: 'opacity',
        }}
        initial={false}
        animate={{ opacity: monitorLightOpacity }}
        transition={{
          duration: getDuration(monitorLightOpacity),
          delay: hasAnimatedIn ? 0.05 : 0,
          ease: getEasing(monitorLightOpacity)
        }}
      />
      
      {/* Subtle pulsing glow layer */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, hsl(var(--glow-base) / 0.04) 0%, transparent 70%)`,
          filter: 'blur(120px)',
          willChange: 'opacity',
        }}
        initial={false}
        animate={{
          opacity: (allLightsOn && hasAnimatedIn) ? [0.15, 0.25, 0.15] : 0,
          scale: (allLightsOn && hasAnimatedIn) ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
};
