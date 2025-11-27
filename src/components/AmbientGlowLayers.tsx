import { motion } from "framer-motion";
import { useMemo } from "react";

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
  const spotlightOpacity = useMemo(() => Math.pow(spotlightIntensity / 100, 0.8), [spotlightIntensity]);
  const deskLampOpacity = useMemo(() => Math.pow(deskLampIntensity / 100, 0.8), [deskLampIntensity]);
  const monitorLightOpacity = useMemo(() => Math.pow(monitorLightIntensity / 100, 0.8), [monitorLightIntensity]);

  return (
    <>
      {/* Spotlight ambient glow - warm golden orange */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 35%, hsl(32 65% 58% / 0.22) 0%, hsl(35 60% 52% / 0.12) 30%, transparent 60%)`,
          filter: 'blur(70px)',
        }}
        animate={{
          opacity: spotlightOpacity,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Desk lamp ambient glow - rich warm gold */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 30% 55%, hsl(42 75% 60% / 0.20) 0%, hsl(40 70% 55% / 0.10) 35%, transparent 58%)`,
          filter: 'blur(65px)',
        }}
        animate={{
          opacity: deskLampOpacity,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Monitor light ambient glow - warm cream beige */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 40%, hsl(38 50% 60% / 0.18) 0%, hsl(35 45% 55% / 0.09) 38%, transparent 62%)`,
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: monitorLightOpacity,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Additional subtle pulsing glow layer - creates living, breathing atmosphere */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, hsl(38 60% 55% / 0.08) 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
        animate={{
          opacity: [(allLightsOn ? 0.3 : 0), (allLightsOn ? 0.5 : 0), (allLightsOn ? 0.3 : 0)],
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
