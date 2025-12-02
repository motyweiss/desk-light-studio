import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import { LIGHT_ANIMATION } from "@/constants/animations";

interface AmbientGlowLayersProps {
  spotlightIntensity: number;
  deskLampIntensity: number;
  monitorLightIntensity: number;
  allLightsOn: boolean;
}

export const AmbientGlowLayers = ({
  spotlightIntensity,
  deskLampIntensity,
  monitorLightIntensity,
  allLightsOn
}: AmbientGlowLayersProps) => {
  const spotlightOpacity = useMemo(() => Math.pow(spotlightIntensity / 100, 2.2) * 0.5, [spotlightIntensity]);
  const deskLampOpacity = useMemo(() => Math.pow(deskLampIntensity / 100, 2.2) * 0.5, [deskLampIntensity]);
  const monitorLightOpacity = useMemo(() => Math.pow(monitorLightIntensity / 100, 2.2) * 0.5, [monitorLightIntensity]);

  // Unified animation timing with stagger delay
  const getDuration = useCallback((targetOpacity: number) => {
    return targetOpacity > 0 ? LIGHT_ANIMATION.turnOn.duration : LIGHT_ANIMATION.turnOff.duration;
  }, []);

  const getEasing = useCallback((targetOpacity: number) => {
    return targetOpacity > 0 ? LIGHT_ANIMATION.turnOn.ease : LIGHT_ANIMATION.turnOff.ease;
  }, []);

  return (
    <>
      {/* Spotlight ambient glow - warm golden orange */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 35%, hsl(var(--glow-warm-orange) / 0.12) 0%, hsl(var(--glow-base) / 0.06) 30%, transparent 60%)`,
          filter: 'blur(90px)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: spotlightOpacity,
        }}
        transition={{
          duration: getDuration(spotlightOpacity),
          delay: LIGHT_ANIMATION.stagger.glow,
          ease: getEasing(spotlightOpacity)
        }}
      />
      
      {/* Desk lamp ambient glow - rich warm gold */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 30% 55%, hsl(var(--glow-warm-gold) / 0.11) 0%, hsl(var(--glow-warm-orange) / 0.05) 35%, transparent 58%)`,
          filter: 'blur(85px)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: deskLampOpacity,
        }}
        transition={{
          duration: getDuration(deskLampOpacity),
          delay: LIGHT_ANIMATION.stagger.glow,
          ease: getEasing(deskLampOpacity)
        }}
      />
      
      {/* Monitor light ambient glow - warm cream beige */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 40%, hsl(var(--glow-warm-cream) / 0.10) 0%, hsl(var(--glow-base) / 0.04) 38%, transparent 62%)`,
          filter: 'blur(80px)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: monitorLightOpacity,
        }}
        transition={{
          duration: getDuration(monitorLightOpacity),
          delay: LIGHT_ANIMATION.stagger.glow,
          ease: getEasing(monitorLightOpacity)
        }}
      />
      
      {/* Additional subtle pulsing glow layer - creates living, breathing atmosphere */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, hsl(var(--glow-base) / 0.04) 0%, transparent 70%)`,
          filter: 'blur(120px)',
        }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{
          opacity: [(allLightsOn ? 0.15 : 0), (allLightsOn ? 0.25 : 0), (allLightsOn ? 0.15 : 0)],
          scale: [1, 1.05, 1],
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
