import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { useClimate } from '../context/ClimateContext';
import { ClimateIndicatorTooltip } from './ClimateIndicatorTooltip';
import { useTrendData } from '../hooks/useTrendData';

export const ClimateIndicators = () => {
  const climate = useClimate();
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);
  
  // Animated counters
  const tempCount = useMotionValue(climate.temperature);
  const tempDisplay = useTransform(tempCount, (latest) => latest.toFixed(1));
  
  const humidityCount = useMotionValue(climate.humidity);
  const humidityDisplay = useTransform(humidityCount, (latest) => Math.round(latest).toString());
  
  const airQualityCount = useMotionValue(climate.airQuality);
  
  // Generate trend data for each sensor
  const temperatureTrend = useTrendData(climate.temperature, 'temperature');
  const humidityTrend = useTrendData(climate.humidity, 'humidity');
  const airQualityTrend = useTrendData(climate.airQuality, 'airQuality');
  
  useEffect(() => {
    const tempControls = animate(tempCount, climate.temperature, {
      duration: 2,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    const humidityControls = animate(humidityCount, climate.humidity, {
      duration: 2,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    const airQualityControls = animate(airQualityCount, climate.airQuality, {
      duration: 2,
      ease: [0.22, 0.03, 0.26, 1]
    });
    
    return () => {
      tempControls.stop();
      humidityControls.stop();
      airQualityControls.stop();
    };
  }, [climate.temperature, climate.humidity, climate.airQuality, tempCount, humidityCount, airQualityCount]);

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
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: climate.isLoaded ? 1 : 0,
        y: climate.isLoaded ? 0 : 10
      }}
      transition={{ 
        duration: 0.6,
        delay: 0.4,
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
        />
      </div>
    </motion.div>
  );
};
