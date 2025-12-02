import { useState, useEffect } from "react";

/**
 * Mock trend data generator for climate sensors
 * Generates realistic 24-hour trend data for demo purposes
 */
export const useTrendData = (currentValue: number, sensorType: 'temperature' | 'humidity' | 'airQuality') => {
  const [trendData, setTrendData] = useState<number[]>([]);

  useEffect(() => {
    // Generate 24 data points (hourly over 24 hours)
    const generateTrendData = () => {
      const points: number[] = [];
      const dataPoints = 24;
      
      // Define variation ranges based on sensor type
      const variation = {
        temperature: 3, // ±3°C
        humidity: 10,   // ±10%
        airQuality: 15  // ±15 µg/m³
      }[sensorType];
      
      // Generate smooth trend with some randomness
      for (let i = 0; i < dataPoints; i++) {
        const progress = i / (dataPoints - 1);
        
        // Create a wave pattern for natural variation
        const wave = Math.sin(progress * Math.PI * 2) * variation * 0.5;
        const randomNoise = (Math.random() - 0.5) * variation * 0.3;
        
        // Gradually trend toward current value
        const trendTowardsCurrent = currentValue - (currentValue - (currentValue + wave)) * (1 - progress);
        
        points.push(Math.max(0, trendTowardsCurrent + randomNoise));
      }
      
      // Ensure last point is exactly the current value
      points[points.length - 1] = currentValue;
      
      return points;
    };

    setTrendData(generateTrendData());
  }, [currentValue, sensorType]);

  return trendData;
};
