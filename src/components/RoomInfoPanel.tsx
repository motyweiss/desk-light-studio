import { motion, AnimatePresence } from "framer-motion";
import { Power, Zap } from "lucide-react";
import { LightControlCard } from "@/features/lighting/components/LightControlCard";
import { CircularProgress } from "@/features/climate/components/CircularProgress";
import { AirPodsMaxIcon } from "./icons/AirPodsMaxIcon";
import { IPhoneIcon } from "./icons/IPhoneIcon";
import { DATA_TRANSITION } from "@/constants/animations";

interface Light {
  id: string;
  label: string;
  intensity: number;
  isPending?: boolean;
  isLoading?: boolean;
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
  masterSwitchOn: boolean;
  onMasterToggle: (checked: boolean) => void;
  onLightHover: (lightId: string | null) => void;
  lights: Light[];
  devices?: Device[];
  isLoaded: boolean;
  showSkeleton?: boolean;
  dataReady?: boolean;
}

export const RoomInfoPanel = ({ 
  roomName, 
  masterSwitchOn, 
  onMasterToggle, 
  onLightHover, 
  lights, 
  devices,
  isLoaded,
  showSkeleton = false,
  dataReady = true
}: RoomInfoPanelProps) => {

  return (
    <motion.div 
      className="space-y-4 md:space-y-8"
      initial={false}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: DATA_TRANSITION.fadeIn.duration }}
    >
      {/* Room Title with Master Switch */}
      <div className="flex items-center justify-between gap-4 md:gap-6">
        <h1 className="text-2xl md:text-4xl font-display font-light tracking-tight text-foreground leading-tight">
          {roomName}
        </h1>
        
        {/* Master Switch - Circular Frosted Glass Button */}
        <motion.button
          initial={false}
          animate={{ 
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
            borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ 
            backgroundColor: { duration: 0.3 },
            borderColor: { duration: 0.3 }
          }}
          onClick={() => onMasterToggle(!masterSwitchOn)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-xl border transition-colors duration-300 flex-shrink-0"
          whileHover={{
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
          }}
          whileTap={{ scale: 0.92 }}
          aria-label="Toggle all lights"
        >
          <motion.div
            animate={{
              color: masterSwitchOn ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            <Power className="w-4 h-4" strokeWidth={2} />
          </motion.div>
        </motion.button>
      </div>

      {/* Devices Battery Section - Desktop only */}
      <div className="hidden md:block rounded-2xl py-6 px-6">
        {devices && devices.length > 0 && (
          <div className="flex flex-row gap-10">
            {devices.map((device, index) => {
              const DeviceIcon = device.icon === 'headphones' ? AirPodsMaxIcon : IPhoneIcon;
              
              return (
                <motion.div 
                  key={device.id} 
                  className="flex items-center gap-3"
                  initial={false}
                  animate={{ opacity: dataReady ? 1 : 0.7 }}
                  transition={{ 
                    duration: DATA_TRANSITION.reveal.duration,
                    delay: DATA_TRANSITION.reveal.stagger * index
                  }}
                >
                  <CircularProgress 
                    value={device.batteryLevel} 
                    min={0} 
                    max={100} 
                    size={44} 
                    strokeWidth={2.5}
                    isLoaded={dataReady}
                    showSkeleton={showSkeleton}
                    colorType="battery"
                    delay={0.2 + (index * 0.1)}
                  >
                    <DeviceIcon className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                  </CircularProgress>
                  
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
                      {device.name}
                    </span>
                    <AnimatePresence mode="wait">
                      {showSkeleton ? (
                        <motion.div
                          key="skeleton"
                          className="h-5 w-12 bg-white/10 rounded"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          exit={{ opacity: 0 }}
                          transition={{
                            opacity: {
                              duration: DATA_TRANSITION.skeleton.shimmerDuration,
                              repeat: Infinity,
                              ease: DATA_TRANSITION.skeleton.pulseEase,
                            }
                          }}
                        />
                      ) : (
                        <motion.div 
                          key="value"
                          className="text-base font-light text-white tabular-nums flex items-center gap-1.5"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: DATA_TRANSITION.fadeIn.duration,
                            delay: 0.1 + (index * 0.05)
                          }}
                        >
                          <span>{device.batteryLevel}%</span>
                          {device.isCharging && (
                            <Zap className="w-3.5 h-3.5 text-status-caution" fill="currentColor" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Light Controls Section */}
      <div className="space-y-2 md:mt-6">
        {lights.map((light, index) => (
          <motion.div 
            key={light.id}
            initial={false}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ 
              duration: DATA_TRANSITION.reveal.duration,
              delay: DATA_TRANSITION.reveal.stagger * index
            }}
          >
            <LightControlCard
              id={light.id}
              label={light.label}
              intensity={light.intensity}
              isPending={light.isPending}
              isLoading={showSkeleton || light.isLoading}
              onChange={light.onChange}
              onHover={(isHovered) => onLightHover(isHovered ? light.id : null)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
