import { useState, useEffect } from "react";
import { BaseGradientLayer } from "./BaseGradientLayer";
import { WarmthLayer } from "./WarmthLayer";
import { GlassOverlay } from "./GlassOverlay";
import { useBackgroundIntensity } from "../hooks/useBackgroundIntensity";

interface DynamicBackgroundProps {
  spotlightIntensity?: number;
  deskLampIntensity?: number;
  monitorLightIntensity?: number;
  dataReady?: boolean;
}

/**
 * Dynamic Background System
 * 
 * Four-layer architecture:
 * 1. Base Gradient Layer - Static mesh gradient for depth
 * 2. Warmth Layer - Dynamic color responding to light intensities
 * 3. Glass Overlay - Frosted glass texture effect
 * 4. Ambient Glows - Handled by AmbientGlowLayers component (separate)
 */
export const DynamicBackground = ({
  spotlightIntensity = 0,
  deskLampIntensity = 0,
  monitorLightIntensity = 0,
  dataReady = false,
}: DynamicBackgroundProps) => {
  const [isReady, setIsReady] = useState(false);
  
  // Trigger ready state after mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const { cssColor, warmth } = useBackgroundIntensity({
    spotlight: spotlightIntensity,
    deskLamp: deskLampIntensity,
    monitorLight: monitorLightIntensity,
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Layer 1: Base Gradient */}
      <BaseGradientLayer isReady={isReady} />
      
      {/* Layer 2: Dynamic Warmth */}
      <WarmthLayer 
        cssColor={cssColor} 
        warmth={warmth}
        isReady={isReady}
        dataReady={dataReady}
      />
      
      {/* Layer 3: Glass Overlay */}
      <GlassOverlay isReady={isReady} />
    </div>
  );
};
