import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { ClimateIndicatorTooltip } from './ClimateIndicatorTooltip';
import { useHistoryData } from '../hooks/useHistoryData';
import { useHomeAssistantConfig } from '@/hooks/useHomeAssistantConfig';

export const ClimateIndicators = () => {
  const climate = useClimate();
  const { isConnected, entityMapping } = useHomeAssistantConfig();
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);
  
  // Animated counters - start from 0 for smooth initial animation
  const tempCount = useMotionValue(0);
  const tempDisplay = useTransform(tempCount, (latest) => latest.toFixed(1));
  
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
  
  useEffect(() => {
    // Faster animation for initial defaults, slower for real data
    const duration = climate.isLoaded ? 1.5 : 0.8;
    
    const tempControls = animate(tempCount, climate.temperature, {
      duration,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    const humidityControls = animate(humidityCount, climate.humidity, {
      duration,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    const airQualityControls = animate(airQualityCount, climate.airQuality, {
      duration,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    return () => {
      tempControls.stop();
      humidityControls.stop();
      airQualityControls.stop();
    };
  }, [climate.temperature, climate.humidity, climate.airQuality, climate.isLoaded, tempCount, humidityCount, airQualityCount]);

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

  return (
    <motion.div 
      className="flex items-center gap-2 md:gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1,
        y: 0
      }}
      transition={{ 
        duration: 0.6,
        delay: 0.2,
        ease: [0.22, 0.03, 0.26, 1]
      }}
    >
      <div
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
            climate.temperature <= 17 ? "hsl(var(--status-cold))" :
            climate.temperature <= 20 ? "hsl(var(--status-cool))" :
            climate.temperature <= 24 ? "hsl(var(--status-comfortable))" :
            climate.temperature <= 28 ? "hsl(var(--status-warm))" :
            "hsl(var(--status-hot))"
          }
          onToggle={() => {}}
          progressValue={climate.temperature}
          progressMax={35}
          progressMin={15}
          colorType="temperature"
          isLoading={!climate.isLoaded}
        />
      </div>
      
      <div
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
          color={
            (climate.humidity >= 40 && climate.humidity <= 60) ? "hsl(var(--status-optimal))" :
            ((climate.humidity >= 30 && climate.humidity < 40) || (climate.humidity > 60 && climate.humidity <= 70)) ? "hsl(var(--status-caution))" :
            "hsl(var(--status-danger))"
          }
          onToggle={() => {}}
          progressValue={climate.humidity}
          progressMax={100}
          progressMin={0}
          colorType="humidity"
          isLoading={!climate.isLoaded}
        />
      </div>
      
      <div
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
          color={getAirQualityColor(climate.airQuality)}
          onToggle={() => {}}
          progressValue={climate.airQuality}
          progressMax={100}
          progressMin={0}
          colorType="airQuality"
          isLoading={!climate.isLoaded}
        />
      </div>
    </motion.div>
  );
};
