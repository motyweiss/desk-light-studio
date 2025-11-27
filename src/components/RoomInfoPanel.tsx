import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Thermometer, Droplets, Power } from "lucide-react";
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
    <div className="space-y-4 md:space-y-6">
      {/* Room Title with Master Switch */}
      <motion.div 
        className="flex items-center justify-between"
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
        <h1 className="text-3xl md:text-5xl font-display font-light tracking-wide text-foreground">
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
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-xl border transition-all duration-500 ${
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
            <Power className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Climate Info */}
      <motion.div 
        className="flex gap-4 md:gap-6 py-3 md:py-6"
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
        <div className="flex-1 py-2 md:py-3">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Thermometer className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
            <span className="text-[10px] md:text-xs text-white/40 font-light tracking-widest uppercase">
              Temperature
            </span>
          </div>
          <div className="text-lg md:text-xl font-light text-white/90 tabular-nums">
            <motion.span>{tempDisplay}</motion.span>°
          </div>
        </div>

        {/* Humidity */}
        <div className="flex-1 py-2 md:py-3">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Droplets className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
            <span className="text-[10px] md:text-xs text-white/40 font-light tracking-widest uppercase">
              Humidity
            </span>
          </div>
          <div className="text-lg md:text-xl font-light text-white/90 tabular-nums">
            <motion.span>{humidityDisplay}</motion.span>%
          </div>
        </div>
      </motion.div>

      {/* Light Controls Section */}
      <div>
        {/* Separator */}
        <motion.div 
          className="h-px bg-white/10 mb-5"
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
          className="space-y-2 md:space-y-3 -ml-3 md:-ml-5"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                delayChildren: 0.8,
                staggerChildren: 0.08
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
                hidden: { opacity: 0, y: 15, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
            >
              {index > 0 && (
                <div className="h-px bg-white/10 mb-3" />
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
