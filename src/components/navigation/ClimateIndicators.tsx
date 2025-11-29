import { useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, animate } from 'framer-motion';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { CircularProgress } from '@/components/CircularProgress';
import { useClimate } from '@/contexts/ClimateContext';
import { useEffect } from 'react';

export const ClimateIndicators = () => {
  const climate = useClimate();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking with spring physics
  const mouseX = useSpring(0, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 20 });
  
  // Animated counters
  const tempCount = useMotionValue(climate.temperature);
  const tempDisplay = useTransform(tempCount, (latest) => latest.toFixed(1));
  
  const humidityCount = useMotionValue(climate.humidity);
  const humidityDisplay = useTransform(humidityCount, (latest) => Math.round(latest));
  
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

  const getAirQualityStatus = (value: number): { label: string; color: string } => {
    if (value <= 12) return { label: 'Good', color: 'hsl(142 70% 45%)' };
    if (value <= 35) return { label: 'Moderate', color: 'hsl(45 90% 55%)' };
    if (value <= 55) return { label: 'Sensitive', color: 'hsl(25 90% 55%)' };
    return { label: 'Unhealthy', color: 'hsl(0 75% 55%)' };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isExpanded) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / 15;
    const deltaY = (e.clientY - centerY) / 15;
    
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center cursor-pointer"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Compact View (Default) */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-300"
        >
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-white/60 transition-colors" strokeWidth={1.5} />
            <span className="text-sm font-light text-white/70 tabular-nums transition-colors">
              <motion.span>{tempDisplay}</motion.span>°
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-white/60 transition-colors" strokeWidth={1.5} />
            <span className="text-sm font-light text-white/70 tabular-nums transition-colors">
              <motion.span>{humidityDisplay}</motion.span>%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-white/60 transition-colors" strokeWidth={1.5} />
            <span className="text-sm font-light text-white/70 transition-colors">
              {getAirQualityStatus(climate.airQuality).label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Expanded View (Hover) */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
          }}
          style={{
            x: mouseX,
            y: mouseY,
          }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ 
            duration: 0.35,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3"
        >
          <div className="bg-white/8 backdrop-blur-[24px] border border-white/15 rounded-2xl p-6 min-w-[420px]">
            <motion.div 
              className="flex gap-8"
              variants={{
                show: {
                  transition: {
                    staggerChildren: 0.08,
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {/* Temperature */}
              <motion.div 
                className="flex items-center gap-3"
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1 }
                }}
              >
                <CircularProgress 
                  value={climate.temperature} 
                  min={15} 
                  max={35} 
                  size={48} 
                  strokeWidth={2.5}
                  isLoaded={climate.isLoaded}
                  colorType="temperature"
                  delay={0}
                >
                  <Thermometer className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                </CircularProgress>
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
                    Temperature
                  </span>
                  <div className="text-base font-light text-white tabular-nums">
                    <motion.span>{tempDisplay}</motion.span>°
                  </div>
                </div>
              </motion.div>

              {/* Humidity */}
              <motion.div 
                className="flex items-center gap-3"
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1 }
                }}
              >
                <CircularProgress 
                  value={climate.humidity} 
                  min={0} 
                  max={100} 
                  size={48} 
                  strokeWidth={2.5}
                  isLoaded={climate.isLoaded}
                  colorType="humidity"
                  delay={0}
                >
                  <Droplets className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                </CircularProgress>
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
                    Humidity
                  </span>
                  <div className="text-base font-light text-white tabular-nums">
                    <motion.span>{humidityDisplay}</motion.span>%
                  </div>
                </div>
              </motion.div>

              {/* Air Quality */}
              <motion.div 
                className="flex items-center gap-3"
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1 }
                }}
              >
                <CircularProgress 
                  value={climate.airQuality} 
                  min={0} 
                  max={100} 
                  size={48} 
                  strokeWidth={2.5}
                  isLoaded={climate.isLoaded}
                  colorType="airQuality"
                  delay={0}
                >
                  <Wind className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                </CircularProgress>
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
                    Air Quality
                  </span>
                  <div className="text-base font-light text-white tabular-nums">
                    <span>{getAirQualityStatus(climate.airQuality).label}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
