import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Thermometer, Droplets, Wind } from "lucide-react";
import { CircularProgress } from "./CircularProgress";
import { useState, useEffect } from "react";

interface ClimateTooltipProps {
  temperature: number;
  humidity: number;
  airQuality: number;
  isLoaded: boolean;
}

export const ClimateTooltip = ({ 
  temperature, 
  humidity, 
  airQuality, 
  isLoaded 
}: ClimateTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse tracking for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const translateX = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(mouseY, [-0.5, 0.5], [-6, 6]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-4, 4]);
  
  const springConfig = { stiffness: 120, damping: 25 };
  const translateXSpring = useSpring(translateX, springConfig);
  const translateYSpring = useSpring(translateY, springConfig);
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY, currentTarget } = e;
      const target = currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      
      mouseX.set(x);
      mouseY.set(y);
    };
    
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };
    
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);
  
  const getAirQualityLabel = (pm25: number): string => {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 55) return 'Sensitive';
    return 'Unhealthy';
  };
  
  return (
    <motion.div
      className="absolute z-20 hidden md:block"
      style={{ 
        bottom: '-42px',
        left: 'calc(50% - 80px)', 
        transformStyle: 'preserve-3d',
        perspective: 1000,
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        x: translateXSpring,
        y: translateYSpring,
      }}
      initial={{ opacity: 0, y: 15, scale: 0.9 }}
      animate={{ 
        opacity: isLoaded ? 1 : 0,
        y: isLoaded ? 0 : 15,
        scale: isLoaded ? 1 : 0.9,
      }}
      transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 0.03, 0.26, 1] }}
    >
      <motion.div
        className="relative bg-white/8 backdrop-blur-[32px] border border-white/20 px-4 py-3 rounded-full flex items-center justify-center gap-5"
        style={{
          boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(32px) saturate(180%)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ 
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
      >
        {/* Internal glow layer matching tooltip aesthetic */}
        <motion.div 
          className="absolute inset-0 rounded-full pointer-events-none backdrop-blur-[20px]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(200, 160, 80, 0.06) 0%, transparent 70%)',
            filter: 'blur(12px)',
          }}
        />
        {/* Temperature */}
        <div className="flex items-center">
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                className="overflow-hidden origin-right"
                transition={{ duration: 0.35, ease: [0.22, 0.03, 0.26, 1] }}
              >
                <div className="flex flex-col pr-2 items-end">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Temp</span>
                  <span className="text-sm text-white font-light">
                    {temperature.toFixed(1)}°
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <CircularProgress 
            value={temperature}
            min={15}
            max={35}
            size={36}
            strokeWidth={2}
            colorType="temperature"
            isLoaded={isLoaded}
          >
            <Thermometer className="w-4 h-4 text-white/60" />
          </CircularProgress>
        </div>
        
        {/* Humidity */}
        <div className="flex items-center gap-2">
          <CircularProgress 
            value={humidity}
            min={0}
            max={100}
            size={36}
            strokeWidth={2}
            colorType="humidity"
            isLoaded={isLoaded}
          >
            <Droplets className="w-4 h-4 text-white/60" />
          </CircularProgress>
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                className="overflow-hidden origin-center"
                transition={{ duration: 0.35, ease: [0.22, 0.03, 0.26, 1] }}
              >
                <div className="flex flex-col pl-1">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Humidity</span>
                  <span className="text-sm text-white font-light">
                    {humidity.toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Air Quality */}
        <div className="flex items-center">
          <CircularProgress 
            value={airQuality}
            min={0}
            max={100}
            size={36}
            strokeWidth={2}
            colorType="airQuality"
            isLoaded={isLoaded}
          >
            <Wind className="w-4 h-4 text-white/60" />
          </CircularProgress>
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                className="overflow-hidden origin-left"
                transition={{ duration: 0.35, ease: [0.22, 0.03, 0.26, 1] }}
              >
                <div className="flex flex-col pl-2 items-start">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Air</span>
                  <span className="text-sm text-white font-light">
                    {getAirQualityLabel(airQuality)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
