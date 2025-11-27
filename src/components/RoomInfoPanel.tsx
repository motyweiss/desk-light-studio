import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Thermometer, Droplets, Sun, Wind, Smartphone, Zap, Headphones } from "lucide-react";
import { LightControlCard } from "./LightControlCard";
import { CircularProgress } from "./CircularProgress";
import { useEffect } from "react";

interface Light {
  id: string;
  label: string;
  intensity: number;
  onChange: (intensity: number) => void;
}

interface Device {
  id: string;
  name: string;
  batteryLevel: number;
  isCharging: boolean;
  icon?: 'smartphone' | 'headphones';
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
  devices?: Device[];
  isLoaded: boolean;
}

export const RoomInfoPanel = ({ roomName, temperature, humidity, airQuality, masterSwitchOn, onMasterToggle, onLightHover, lights, devices, isLoaded }: RoomInfoPanelProps) => {
  const getAirQualityStatus = (value: number): { label: string; color: string } => {
    if (value <= 12) return { label: 'Good', color: 'hsl(142 70% 45%)' };
    if (value <= 35) return { label: 'Moderate', color: 'hsl(45 90% 55%)' };
    if (value <= 55) return { label: 'Sensitive', color: 'hsl(25 90% 55%)' };
    return { label: 'Unhealthy', color: 'hsl(0 75% 55%)' };
  };

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
        className="hidden md:flex items-start justify-between gap-6"
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
        <h1 className="text-3xl md:text-4xl font-display font-light tracking-tight md:tracking-tight text-foreground leading-tight">
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
          className={`w-10 h-10 rounded-full backdrop-blur-xl border transition-all duration-500 flex-shrink-0 ${
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
            <Sun className="w-4 h-4" strokeWidth={2} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Climate & Devices Info - Desktop only */}
      <motion.div 
        className="hidden md:block rounded-2xl py-6 px-6"
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
        {/* Climate Info */}
        <div className="flex gap-10 mb-8">
          {/* Temperature */}
          <div className="flex items-center gap-3">
                <CircularProgress 
                  value={temperature} 
                  min={15} 
                  max={35} 
                  size={44} 
                  strokeWidth={2.5}
                  isLoaded={isLoaded}
                  colorType="temperature"
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
                  colorType="humidity"
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
                  colorType="airQuality"
                >
              <Wind className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </CircularProgress>
            <div className="flex flex-col">
              <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
                Air Quality
              </span>
              <div className="text-base font-light text-white tabular-nums">
                <span>{getAirQualityStatus(airQuality).label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Devices Battery Section */}
        {devices && devices.length > 0 && (
          <div className="flex flex-col gap-5 mt-8">
            {devices.map((device) => {
              const DeviceIcon = device.icon === 'headphones' ? Headphones : Smartphone;
              
              return (
                <div key={device.id} className="flex items-center gap-3">
                  <CircularProgress 
                    value={device.batteryLevel} 
                    min={0} 
                    max={100} 
                    size={44} 
                    strokeWidth={2.5}
                    isLoaded={isLoaded}
                    colorType="battery"
                  >
                    <DeviceIcon className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                  </CircularProgress>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
                      {device.name}
                    </span>
                    <div className="text-base font-light text-white tabular-nums flex items-center gap-1.5">
                      <span>{device.batteryLevel}%</span>
                      {device.isCharging && (
                        <Zap className="w-3.5 h-3.5 text-[hsl(45_90%_55%)]" fill="currentColor" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
      <div className="rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.05] mt-10">
        <motion.div
          className="space-y-0"
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
                <div className="h-px bg-white/10 w-full mx-0" />
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
