import { useState, useEffect } from 'react';
import { haClient } from '@/api/homeAssistant/client';
import { logger } from '@/shared/utils/logger';

/**
 * Hook to fetch and process historical sensor data from Home Assistant
 * Falls back to mock data when not connected
 */
export const useHistoryData = (
  entityId: string | undefined,
  isConnected: boolean,
  currentValue: number,
  sensorType: 'temperature' | 'humidity' | 'airQuality'
): number[] => {
  const [historyData, setHistoryData] = useState<number[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isConnected || !entityId) {
        // Generate mock data when not connected
        setHistoryData(generateMockData(currentValue, sensorType));
        return;
      }

      try {
        const history = await haClient.getHistory(entityId, 24);
        
        if (!history || history.length === 0) {
          setHistoryData(generateMockData(currentValue, sensorType));
          return;
        }

        // Parse and filter valid numeric values
        const values = history
          .map(entry => parseFloat(entry.state))
          .filter(val => !isNaN(val) && val !== null);

        if (values.length < 2) {
          setHistoryData(generateMockData(currentValue, sensorType));
          return;
        }

        // Sample data to ~24 points for smooth graph
        const sampledData = sampleData(values, 24);
        setHistoryData(sampledData);
        
        logger.sync(`History loaded for ${entityId}`, { points: sampledData.length });
      } catch (error) {
        logger.error(`Failed to load history for ${entityId}`, error);
        setHistoryData(generateMockData(currentValue, sensorType));
      }
    };

    fetchHistory();
  }, [entityId, isConnected, currentValue, sensorType]);

  return historyData;
};

/**
 * Sample data to target number of points using linear interpolation
 */
const sampleData = (data: number[], targetPoints: number): number[] => {
  if (data.length <= targetPoints) {
    return data;
  }

  const sampled: number[] = [];
  const step = (data.length - 1) / (targetPoints - 1);

  for (let i = 0; i < targetPoints; i++) {
    const index = i * step;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;

    if (lower === upper) {
      sampled.push(data[lower]);
    } else {
      // Linear interpolation
      const interpolated = data[lower] * (1 - fraction) + data[upper] * fraction;
      sampled.push(interpolated);
    }
  }

  return sampled;
};

/**
 * Generate realistic mock trend data for demo purposes
 */
const generateMockData = (
  currentValue: number,
  sensorType: 'temperature' | 'humidity' | 'airQuality'
): number[] => {
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
