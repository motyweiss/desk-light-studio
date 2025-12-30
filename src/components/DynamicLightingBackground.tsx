import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useLighting } from '@/features/lighting';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface GlowConfig {
  opacity: number;
  scale: number;
  x: number;
  y: number;
}

export const DynamicLightingBackground = () => {
  const { lights } = useLighting();
  const prefersReducedMotion = useReducedMotion();

  // Calculate glow configs based on light intensities
  const spotlightGlow = useMemo((): GlowConfig => {
    const intensity = lights.spotlight.displayValue / 100;
    return {
      opacity: intensity * 0.35,
      scale: 0.9 + intensity * 0.3,
      x: 15,
      y: -10,
    };
  }, [lights.spotlight.displayValue]);

  const deskLampGlow = useMemo((): GlowConfig => {
    const intensity = lights.deskLamp.displayValue / 100;
    return {
      opacity: intensity * 0.3,
      scale: 0.85 + intensity * 0.25,
      x: -20,
      y: 5,
    };
  }, [lights.deskLamp.displayValue]);

  const monitorGlow = useMemo((): GlowConfig => {
    const intensity = lights.monitorLight.displayValue / 100;
    return {
      opacity: intensity * 0.25,
      scale: 0.8 + intensity * 0.2,
      x: 0,
      y: 0,
    };
  }, [lights.monitorLight.displayValue]);

  // Check if any light is on
  const anyLightOn = lights.spotlight.displayValue > 0 || 
                     lights.deskLamp.displayValue > 0 || 
                     lights.monitorLight.displayValue > 0;

  // Total ambient intensity for overall background warmth
  const totalIntensity = (
    lights.spotlight.displayValue + 
    lights.deskLamp.displayValue + 
    lights.monitorLight.displayValue
  ) / 300;

  // Transition configs
  const springTransition = {
    type: 'spring' as const,
    stiffness: 40,
    damping: 25,
    mass: 1.2,
  };

  const opacityTransition = {
    duration: 1.2,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  // CSS keyframe animations for floating (applied via style)
  const floatStyle1 = prefersReducedMotion ? {} : {
    animation: 'float1 20s ease-in-out infinite',
  };

  const floatStyle2 = prefersReducedMotion ? {} : {
    animation: 'float2 25s ease-in-out infinite',
  };

  const floatStyle3 = prefersReducedMotion ? {} : {
    animation: 'float3 15s ease-in-out infinite',
  };

  return (
    <>
      {/* CSS Keyframes and Noise Filter */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(4%, -8px); }
          50% { transform: translate(0, 0); }
          75% { transform: translate(-4%, 8px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-5%, 6px); }
          50% { transform: translate(0, 0); }
          75% { transform: translate(5%, -6px); }
        }
        @keyframes float3 {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.05); }
          50% { transform: scale(1); }
          75% { transform: scale(0.98); }
        }
      `}</style>

      {/* SVG Noise Filter Definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="grain-filter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.75" 
              numOctaves="4" 
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        {/* Dark overlay when lights are off - creates cozy darkness */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: anyLightOn ? 0 : 0.12,
          }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, hsl(220 15% 15% / 0.25) 0%, hsl(220 20% 10% / 0.35) 100%)',
          }}
        />

        {/* Base ambient layer - subtle warmth when any light is on */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: anyLightOn ? totalIntensity * 0.15 : 0,
          }}
          transition={opacityTransition}
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, hsl(40 60% 50% / 0.3) 0%, transparent 70%)',
          }}
        />

        {/* Spotlight glow - top right, warm yellow-orange */}
        <motion.div
          className="absolute"
          style={{
            width: '120%',
            height: '100%',
            top: '-30%',
            right: '-30%',
            background: 'radial-gradient(ellipse at 70% 30%, hsl(38 85% 55% / 0.5) 0%, hsl(42 80% 50% / 0.2) 30%, transparent 60%)',
            filter: 'blur(80px)',
            willChange: 'opacity',
            ...floatStyle1,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: spotlightGlow.opacity,
          }}
          transition={opacityTransition}
        />

        {/* Desk lamp glow - left side, warm yellow */}
        <motion.div
          className="absolute"
          style={{
            width: '100%',
            height: '120%',
            bottom: '-20%',
            left: '-40%',
            background: 'radial-gradient(ellipse at 30% 70%, hsl(44 80% 58% / 0.45) 0%, hsl(40 75% 52% / 0.15) 35%, transparent 60%)',
            filter: 'blur(100px)',
            willChange: 'opacity',
            ...floatStyle2,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: deskLampGlow.opacity,
          }}
          transition={opacityTransition}
        />

        {/* Monitor light glow - center, cooler white-blue tint */}
        <motion.div
          className="absolute"
          style={{
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            background: 'radial-gradient(ellipse at 50% 45%, hsl(45 40% 70% / 0.35) 0%, hsl(200 30% 60% / 0.1) 40%, transparent 65%)',
            filter: 'blur(90px)',
            willChange: 'opacity',
            ...floatStyle3,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: monitorGlow.opacity,
          }}
          transition={opacityTransition}
        />

        {/* Combined ambient overlay - adds depth when multiple lights are on */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 40% 60%, hsl(42 70% 55% / 0.2) 0%, transparent 50%)',
            filter: 'blur(60px)',
            mixBlendMode: 'soft-light',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: totalIntensity > 0.5 ? (totalIntensity - 0.5) * 0.4 : 0,
          }}
          transition={opacityTransition}
        />

        {/* Subtle vignette for depth - stronger when lights off */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0.4 }}
          animate={{
            opacity: anyLightOn ? 0.3 : 0.7,
          }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, hsl(220 25% 5% / 0.6) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Subtle grain texture overlay - more visible when lights off */}
        <motion.div 
          className="pointer-events-none"
          initial={{ opacity: 0.04 }}
          animate={{
            opacity: anyLightOn ? 0.03 : 0.08,
          }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            right: '-10%',
            bottom: '-10%',
            filter: 'url(#grain-filter)',
            mixBlendMode: 'overlay',
          }}
        />
      </div>
    </>
  );
};
