import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Thermometer, Droplets, Sun, Wind } from "lucide-react";
import { LightControlCard } from "./LightControlCard";
import { CircularProgress } from "./CircularProgress";
import { useEffect } from "react";

interface Light {
  id: string;
  label: string;
  intensity: number;
  onChange: (intensity: number) => void;
}

interface RoomInfoPanelProps {
  roomName: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  masterSwitchOn: boolean;
  onMasterToggle: (checked: boolean) => void;
  onLightHover: (lightId: string | null) => void;
  lights: Light[];
  isLoaded: boolean;
}

export const RoomInfoPanel = ({ roomName, temperature, humidity, airQuality, masterSwitchOn, onMasterToggle, onLightHover, lights, isLoaded }: RoomInfoPanelProps) => {
  // Animated counter for temperature
  const tempCount = useMotionValue(0);
  const tempDisplay = useTransform(tempCount, (latest) => latest.toFixed(1));

  // Animated counter for humidity
  const humidityCount = useMotionValue(0);
  const humidityDisplay = useTransform(humidityCount, (latest) => Math.round(latest));

  // Animated counter for air quality
  const airQualityCount = useMotionValue(0);
  const airQualityDisplay = useTransform(airQualityCount, (latest) => Math.round(latest));

  useEffect(() => {
    if (isLoaded) {
      // Animate temperature counter
      const tempControls = animate(tempCount, temperature, {
        duration: 2,
        delay: 0.5,
        ease: [0.22, 0.03, 0.26, 1]
      });

      // Animate humidity counter
      const humidityControls = animate(humidityCount, humidity, {
        duration: 2,
        delay: 0.5,
        ease: [0.22, 0.03, 0.26, 1]
      });

      // Animate air quality counter
      const airQualityControls = animate(airQualityCount, airQuality, {
        duration: 2,
        delay: 0.5,
        ease: [0.22, 0.03, 0.26, 1]
      });

      return () => {
        tempControls.stop();
        humidityControls.stop();
        airQualityControls.stop();
      };
    }
  }, [isLoaded, temperature, humidity, airQuality, tempCount, humidityCount, airQualityCount]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Room Title with Master Switch - Hidden on mobile (shown in Index.tsx) */}
      <motion.div 
        className="hidden md:flex items-start justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 10
        }}
        transition={{ 
          duration: 0.6,
          delay: 0,
          ease: [0.22, 0.03, 0.26, 1]
        }}
      >
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-tight md:tracking-tight text-foreground leading-tight">
          {roomName}
        </h1>
        
        {/* Master Switch - Circular Frosted Glass Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 0.9
          }}
          transition={{ 
            duration: 0.6,
            delay: 0.15,
            ease: [0.22, 0.03, 0.26, 1]
          }}
          onClick={() => onMasterToggle(!masterSwitchOn)}
          className={`w-14 h-14 rounded-full backdrop-blur-xl border-2 transition-all duration-500 flex-shrink-0 ${
            masterSwitchOn 
              ? 'border-[hsl(43_90%_60%/0.7)]' 
              : 'border-white/20 hover:border-white/30'
          }`}
          whileTap={{ scale: 0.92 }}
          aria-label="Toggle all lights"
        >
          <motion.div
            animate={{
              color: masterSwitchOn ? 'hsl(44 92% 62%)' : 'rgba(255, 255, 255, 0.4)',
            }}
            transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
            className="flex items-center justify-center"
          >
            <Sun className="w-6 h-6" strokeWidth={2} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Climate Info - Full version hidden on mobile, compact version shown */}
      {/* Desktop version - Full */}
      <motion.div 
        className="hidden md:flex gap-6 py-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 10
        }}
        transition={{ 
          duration: 0.6,
          delay: 0.2,
          ease: [0.22, 0.03, 0.26, 1]
        }}
      >
        {/* Temperature */}
        <div className="flex items-center gap-3">
          <CircularProgress 
            value={temperature} 
            min={15} 
            max={35} 
            size={44} 
            strokeWidth={2.5}
            isLoaded={isLoaded}
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
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-3">
          <CircularProgress 
            value={humidity} 
            min={0} 
            max={100} 
            size={44} 
            strokeWidth={2.5}
            isLoaded={isLoaded}
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
        </div>

        {/* PM 2.5 */}
        <div className="flex items-center gap-3">
          <CircularProgress 
            value={airQuality} 
            min={0} 
            max={100} 
            size={44} 
            strokeWidth={2.5}
            isLoaded={isLoaded}
          >
            <Wind className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </CircularProgress>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
              PM 2.5
            </span>
            <div className="text-base font-light text-white tabular-nums">
              <motion.span>{airQualityDisplay}</motion.span>
              <span className="text-[10px] text-white/40 ml-1">µg/m³</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile version - Minimal inline */}
      <motion.div 
        className="flex md:hidden justify-center gap-8 py-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 10
        }}
        transition={{ 
          duration: 0.6,
          delay: 0.2,
          ease: [0.22, 0.03, 0.26, 1]
        }}
        style={{ display: 'none' }}
      >
        {/* Temperature - Icon + Number only */}
        <div className="flex items-center gap-2">
          <CircularProgress 
            value={temperature} 
            min={15} 
            max={35} 
            size={32} 
            strokeWidth={2}
            isLoaded={isLoaded}
          >
            <Thermometer className="w-4 h-4 text-white/60" strokeWidth={1.5} />
          </CircularProgress>
          <div className="text-base font-light text-white tabular-nums">
            <motion.span>{tempDisplay}</motion.span>°
          </div>
        </div>

        {/* Humidity - Icon + Number only */}
        <div className="flex items-center gap-2">
          <CircularProgress 
            value={humidity} 
            min={0} 
            max={100} 
            size={32} 
            strokeWidth={2}
            isLoaded={isLoaded}
          >
            <Droplets className="w-4 h-4 text-white/60" strokeWidth={1.5} />
          </CircularProgress>
          <div className="text-base font-light text-white tabular-nums">
            <motion.span>{humidityDisplay}</motion.span>%
          </div>
        </div>

        {/* PM 2.5 - Icon + Number only */}
        <div className="flex items-center gap-2">
          <CircularProgress 
            value={airQuality} 
            min={0} 
            max={100} 
            size={32} 
            strokeWidth={2}
            isLoaded={isLoaded}
          >
            <Wind className="w-4 h-4 text-white/60" strokeWidth={1.5} />
          </CircularProgress>
          <div className="text-base font-light text-white tabular-nums">
            <motion.span>{airQualityDisplay}</motion.span>
          </div>
        </div>
      </motion.div>

      {/* Light Controls Section */}
      <div>
        {/* Separator - Hidden on mobile */}
        <motion.div 
          className="hidden md:block h-px bg-white/10 mb-6"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: isLoaded ? 1 : 0,
            opacity: isLoaded ? 1 : 0
          }}
          transition={{ 
            duration: 0.6,
            delay: 0.6,
            ease: [0.22, 0.03, 0.26, 1]
          }}
          style={{ originX: 0 }}
        />
        
        <motion.div 
          className="space-y-2 md:space-y-4 md:-ml-5"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                delayChildren: 0.8,
                staggerChildren: 0.15
              }
            }
          }}
          initial="hidden"
          animate={isLoaded ? "show" : "hidden"}
        >
          {lights.map((light, index) => (
            <motion.div
              key={light.id}
              variants={{
                hidden: { opacity: 0, y: 25, scale: 0.94, filter: 'blur(4px)' },
                show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              }}
              transition={{ duration: 0.7, ease: [0.22, 0.03, 0.26, 1] }}
            >
              {index > 0 && (
                <div className="h-px bg-white/10 mb-3 md:mb-4" />
              )}
              <LightControlCard
                id={light.id}
                label={light.label}
                intensity={light.intensity}
                onChange={light.onChange}
                onHover={(isHovered) => onLightHover(isHovered ? light.id : null)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
