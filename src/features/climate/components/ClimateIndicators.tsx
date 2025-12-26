import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { ClimateIndicatorTooltip } from './ClimateIndicatorTooltip';
import { useHistoryData } from '../hooks/useHistoryData';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { AnimatedCounter } from '@/components/AnimatedCounter';

// Stagger animation variants for each indicator - scale up with fade
const indicatorVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.85
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.2 + i * 0.1,
      duration: 0.4,
      ease: [0.22, 0.03, 0.26, 1] as const
    }
  }),
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

export const ClimateIndicators = () => {
  const climate = useClimate();
  const { isConnected, entityMapping } = useHAConnection();
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);
  
  // Fetch historical data for each sensor
  const temperatureTrend = useHistoryData(
    entityMapping?.temperatureSensor,
    isConnected,
    climate.temperature,
    'temperature'
  );
  
  const humidityTrend = useHistoryData(
    entityMapping?.humiditySensor,
    isConnected,
    climate.humidity,
    'humidity'
  );
  
  const airQualityTrend = useHistoryData(
    entityMapping?.airQualitySensor,
    isConnected,
    climate.airQuality,
    'airQuality'
  );

  const getAirQualityStatus = (value: number): string => {
    if (value <= 12) return 'Good';
    if (value <= 35) return 'Moderate';
    if (value <= 55) return 'Sensitive';
    return 'Unhealthy';
  };

  const getAirQualityColor = (value: number): string => {
    if (value <= 12) return "hsl(var(--status-comfortable))";
    if (value <= 35) return "hsl(var(--status-caution))";
    if (value <= 55) return "hsl(var(--status-warning))";
    return "hsl(var(--status-danger))";
  };

  const handleMouseEnter = (id: string) => {
    setHoveredIndicator(id);
  };

  const handleMouseLeave = () => {
    setHoveredIndicator(null);
  };

  // Show loading skeleton while waiting for data
  // Changed: Show indicators even during loading to prevent layout shift
  const showLoadingState = !climate.isLoaded;

  // Render temperature value with AnimatedCounter
  const renderTemperatureValue = () => (
    <AnimatedCounter 
      value={Math.round(climate.temperature)} 
      delay={0.3}
      isActive={climate.isLoaded}
    />
  );

  // Render humidity value with AnimatedCounter
  const renderHumidityValue = () => (
    <AnimatedCounter 
      value={Math.round(climate.humidity)} 
      delay={0.4}
      isActive={climate.isLoaded}
    />
  );

  return (
    <div className="flex items-center gap-3 md:gap-5">
      <motion.div
        custom={0}
        variants={indicatorVariants}
        initial="hidden"
        animate="visible"
        onMouseEnter={() => handleMouseEnter('temperature')}
        onMouseLeave={handleMouseLeave}
      >
        <ClimateIndicatorTooltip
          isOpen={hoveredIndicator === 'temperature'}
          icon={Thermometer}
          label="Temperature"
          value={`${Math.round(climate.temperature)}`}
          unit="°C"
          trendData={temperatureTrend}
          color={
            climate.temperature <= 18 ? "hsl(210 80% 55%)" :
            climate.temperature <= 20 ? "hsl(190 70% 50%)" :
            climate.temperature <= 22 ? "hsl(160 60% 48%)" :
            climate.temperature <= 24 ? "hsl(45 80% 55%)" :
            climate.temperature <= 26 ? "hsl(30 85% 55%)" :
            climate.temperature <= 28 ? "hsl(15 85% 55%)" :
            "hsl(0 80% 55%)"
          }
          onToggle={() => {}}
          colorType="temperature"
          isLoading={!climate.isLoaded}
          renderValue={renderTemperatureValue}
        />
      </motion.div>
      
      <motion.div
        custom={1}
        variants={indicatorVariants}
        initial="hidden"
        animate="visible"
        onMouseEnter={() => handleMouseEnter('humidity')}
        onMouseLeave={handleMouseLeave}
      >
        <ClimateIndicatorTooltip
          isOpen={hoveredIndicator === 'humidity'}
          icon={Droplets}
          label="Humidity"
          value={`${Math.round(climate.humidity)}`}
          unit="%"
          trendData={humidityTrend}
          color="rgba(255, 255, 255, 0.7)"
          onToggle={() => {}}
          colorType="humidity"
          isLoading={!climate.isLoaded}
          renderValue={renderHumidityValue}
        />
      </motion.div>
      
      <motion.div
        custom={2}
        variants={indicatorVariants}
        initial="hidden"
        animate="visible"
        onMouseEnter={() => handleMouseEnter('airQuality')}
        onMouseLeave={handleMouseLeave}
      >
        <ClimateIndicatorTooltip
          isOpen={hoveredIndicator === 'airQuality'}
          icon={Wind}
          label="Air Quality"
          value={getAirQualityStatus(climate.airQuality)}
          unit=""
          trendData={airQualityTrend}
          color="rgba(255, 255, 255, 0.7)"
          onToggle={() => {}}
          colorType="airQuality"
          isLoading={!climate.isLoaded}
        />
      </motion.div>
    </div>
  );
};