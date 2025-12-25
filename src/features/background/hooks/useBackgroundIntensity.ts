import { useMemo } from "react";
import { BACKGROUND_COLORS } from "../constants";

interface LightIntensities {
  spotlight: number;
  deskLamp: number;
  monitorLight: number;
}

interface BackgroundValues {
  warmth: number;
  hue: number;
  saturation: number;
  lightness: number;
  cssColor: string;
}

/**
 * Calculates dynamic background color values based on light intensities
 * Uses subtle color shifts that harmonize with desk images
 */
export const useBackgroundIntensity = (intensities: LightIntensities): BackgroundValues => {
  return useMemo(() => {
    const { spotlight, deskLamp, monitorLight } = intensities;
    const { base, warm, weights } = BACKGROUND_COLORS;
    
    // Calculate weighted warmth (0-1 range)
    const warmth = (
      (spotlight / 100) * weights.spotlight +
      (deskLamp / 100) * weights.deskLamp +
      (monitorLight / 100) * weights.monitorLight
    );
    
    // Apply subtle gamma curve for natural perception
    // Using gentler curve to avoid drastic color changes
    const gammaCorrectedWarmth = Math.pow(warmth, 0.9);
    
    // Subtle interpolation between base and warm colors
    const lerp = (start: number, end: number, t: number) => 
      start + (end - start) * t;
    
    const hue = lerp(base.hue, warm.hue, gammaCorrectedWarmth);
    const saturation = lerp(base.saturation, warm.saturation, gammaCorrectedWarmth);
    const lightness = lerp(base.lightness, warm.lightness, gammaCorrectedWarmth);
    
    const cssColor = `hsl(${hue} ${saturation}% ${lightness}%)`;
    
    return {
      warmth: gammaCorrectedWarmth,
      hue,
      saturation,
      lightness,
      cssColor,
    };
  }, [intensities.spotlight, intensities.deskLamp, intensities.monitorLight]);
};
