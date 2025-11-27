import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Thermometer, Droplets, Sun } from "lucide-react";
import { LightControlCard } from "./LightControlCard";
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
  masterSwitchOn: boolean;
  onMasterToggle: (checked: boolean) => void;
  onLightHover: (lightId: string | null) => void;
  lights: Light[];
  isLoaded: boolean;
}

export const RoomInfoPanel = ({ roomName, temperature, humidity, masterSwitchOn, onMasterToggle, onLightHover, lights, isLoaded }: RoomInfoPanelProps) => {
  // Animated counter for temperature
  const tempCount = useMotionValue(0);
  const tempDisplay = useTransform(tempCount, (latest) => latest.toFixed(1));

  // Animated counter for humidity
  const humidityCount = useMotionValue(0);
  const humidityDisplay = useTransform(humidityCount, (latest) => Math.round(latest));

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

      return () => {
        tempControls.stop();
        humidityControls.stop();
      };
    }
  }, [isLoaded, temperature, humidity, tempCount, humidityCount]);

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
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-wide text-foreground leading-tight">
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
              ? 'border-[hsl(38_70%_58%/0.6)]' 
              : 'border-white/20 hover:border-white/30'
          }`}
          whileTap={{ scale: 0.92 }}
          aria-label="Toggle all lights"
        >
          <motion.div
            animate={{
              color: masterSwitchOn ? 'hsl(42 75% 60%)' : 'rgba(255, 255, 255, 0.4)',
            }}
            transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
            className="flex items-center justify-center"
          >
            <Sun className="w-6 h-6" strokeWidth={2} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Climate Info - Hidden on mobile (shown in Index.tsx) */}
      <motion.div 
        className="hidden md:flex gap-12 py-6"
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
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm">
            <Thermometer className="w-6 h-6 text-white/50" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 font-light tracking-[0.2em] uppercase mb-1.5">
              Temperature
            </span>
            <div className="text-base md:text-lg font-light text-white tabular-nums">
              <motion.span>{tempDisplay}</motion.span>°
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm">
            <Droplets className="w-6 h-6 text-white/50" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 font-light tracking-[0.2em] uppercase mb-1.5">
              Humidity
            </span>
            <div className="text-base md:text-lg font-light text-white tabular-nums">
              <motion.span>{humidityDisplay}</motion.span>%
            </div>
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
          className="space-y-2 md:space-y-4 px-3 md:px-0 -ml-0 md:-ml-5"
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
