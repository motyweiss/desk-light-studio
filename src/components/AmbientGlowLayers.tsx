import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import { EASING, DURATION } from "@/constants/animations";

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

  // Dynamic duration based on whether lights are turning on or off
  const getDuration = useCallback((targetOpacity: number) => {
    return targetOpacity > 0 ? DURATION.glowOn : DURATION.glowOff;
  }, []);

  const getEasing = useCallback((targetOpacity: number) => {
    return targetOpacity > 0 ? EASING.smooth : EASING.quickOut;
  }, []);

  return (
    <>
      {/* Spotlight ambient glow - warm golden orange */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 35%, hsl(40 45% 50% / 0.12) 0%, hsl(42 40% 48% / 0.06) 30%, transparent 60%)`,
          filter: 'blur(90px)',
        }}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{
          opacity: spotlightOpacity,
          scale: spotlightOpacity > 0 ? 1 : 1.02,
        }}
        transition={{
          duration: getDuration(spotlightOpacity),
          delay: DURATION.glowDelay,
          ease: getEasing(spotlightOpacity)
        }}
      />
      
      {/* Desk lamp ambient glow - rich warm gold */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 30% 55%, hsl(42 50% 52% / 0.11) 0%, hsl(44 45% 50% / 0.05) 35%, transparent 58%)`,
          filter: 'blur(85px)',
        }}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{
          opacity: deskLampOpacity,
          scale: deskLampOpacity > 0 ? 1 : 1.02,
        }}
        transition={{
          duration: getDuration(deskLampOpacity),
          delay: DURATION.glowDelay,
          ease: getEasing(deskLampOpacity)
        }}
      />
      
      {/* Monitor light ambient glow - warm cream beige */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 40%, hsl(41 48% 52% / 0.10) 0%, hsl(43 43% 50% / 0.04) 38%, transparent 62%)`,
          filter: 'blur(80px)',
        }}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{
          opacity: monitorLightOpacity,
          scale: monitorLightOpacity > 0 ? 1 : 1.02,
        }}
        transition={{
          duration: getDuration(monitorLightOpacity),
          delay: DURATION.glowDelay,
          ease: getEasing(monitorLightOpacity)
        }}
      />
      
      {/* Additional subtle pulsing glow layer - creates living, breathing atmosphere */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, hsl(41 40% 48% / 0.04) 0%, transparent 70%)`,
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
