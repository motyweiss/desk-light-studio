import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { ClimateIndicatorTooltip } from './ClimateIndicatorTooltip';
import { useHistoryData } from '../hooks/useHistoryData';
import { useHAConnection } from '@/contexts/HAConnectionContext';

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
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Animated counters - start from 0 for smooth initial animation
  const tempCount = useMotionValue(0);
  const tempDisplay = useTransform(tempCount, (latest) => Math.round(latest).toString());
  
  const humidityCount = useMotionValue(0);
  const humidityDisplay = useTransform(humidityCount, (latest) => Math.round(latest).toString());
  
  const airQualityCount = useMotionValue(0);
  
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
  
  // Animate counters only after data is loaded
  useEffect(() => {
    if (!climate.isLoaded) return;
    
    // Mark as animated to trigger the reveal
    if (!hasAnimated) {
      setHasAnimated(true);
    }
    
    // Smooth count-up animation
    const duration = 1.2;
    const delay = hasAnimated ? 0 : 0.3; // Initial delay for first animation
    
    const tempControls = animate(tempCount, climate.temperature, {
      duration,
      delay,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    const humidityControls = animate(humidityCount, climate.humidity, {
      duration,
      delay: delay + 0.1,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    const airQualityControls = animate(airQualityCount, climate.airQuality, {
      duration,
      delay: delay + 0.2,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    return () => {
      tempControls.stop();
      humidityControls.stop();
      airQualityControls.stop();
    };
  }, [climate.temperature, climate.humidity, climate.airQuality, climate.isLoaded, tempCount, humidityCount, airQualityCount, hasAnimated]);

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

  return (
    <div className="flex items-center gap-2 md:gap-4">
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
          value={tempDisplay.get()}
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
          progressValue={climate.temperature}
          progressMax={35}
          progressMin={15}
          colorType="temperature"
          isLoading={false}
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
          value={humidityDisplay.get()}
          unit="%"
          trendData={humidityTrend}
          color="rgba(255, 255, 255, 0.7)"
          onToggle={() => {}}
          progressValue={climate.humidity}
          progressMax={100}
          progressMin={0}
          colorType="humidity"
          isLoading={false}
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
          progressValue={climate.airQuality}
          progressMax={100}
          progressMin={0}
          colorType="airQuality"
          isLoading={false}
        />
      </motion.div>
    </div>
  );
};