import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { useClimate } from '@/contexts/ClimateContext';
import { ClimateIndicator } from './ClimateIndicator';

export const ClimateIndicators = () => {
  const climate = useClimate();
  
  // Animated counters
  const tempCount = useMotionValue(climate.temperature);
  const tempDisplay = useTransform(tempCount, (latest) => latest.toFixed(1));
  
  const humidityCount = useMotionValue(climate.humidity);
  const humidityDisplay = useTransform(humidityCount, (latest) => Math.round(latest).toString());
  
  const airQualityCount = useMotionValue(climate.airQuality);
  
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

  return (
    <div className="flex items-center gap-3">
      <ClimateIndicator
        icon={Thermometer}
        label="Temperature"
        value={climate.temperature}
        unit="°"
        min={15}
        max={35}
        colorType="temperature"
        isLoaded={climate.isLoaded}
        formatValue={(val) => tempDisplay.get()}
      />
      
      <ClimateIndicator
        icon={Droplets}
        label="Humidity"
        value={climate.humidity}
        unit="%"
        min={0}
        max={100}
        colorType="humidity"
        isLoaded={climate.isLoaded}
        formatValue={(val) => humidityDisplay.get()}
      />
      
      <ClimateIndicator
        icon={Wind}
        label="Air Quality"
        value={climate.airQuality}
        unit=""
        min={0}
        max={100}
        colorType="airQuality"
        isLoaded={climate.isLoaded}
        formatValue={(val) => getAirQualityStatus(val)}
      />
    </div>
  );
};
