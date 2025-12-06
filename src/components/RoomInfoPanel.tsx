import { motion } from "framer-motion";
import { Power, Zap } from "lucide-react";
import { LightControlCard } from "@/features/lighting/components/LightControlCard";
import { CircularProgress } from "@/features/climate/components/CircularProgress";
import { AirPodsMaxIcon } from "./icons/AirPodsMaxIcon";
import { IPhoneIcon } from "./icons/IPhoneIcon";
import { PAGE_LOAD_SEQUENCE } from "@/constants/animations";

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

// Unified smooth transition config
const smoothTransition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ 
        opacity: isLoaded ? 1 : 0,
        y: isLoaded ? 0 : 15
      }}
      transition={{
        ...smoothTransition,
        delay: 0.05,
      }}
    >
      {/* Room Title with Master Switch */}
      <motion.div 
        className="flex items-center justify-between gap-4 md:gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 10
        }}
        transition={{
          ...smoothTransition,
          delay: 0.1,
        }}
      >
        <h1 className="text-2xl md:text-4xl font-display font-light tracking-tight text-foreground leading-tight">
          {roomName}
        </h1>
        
        {/* Master Switch */}
        <motion.button
          initial={false}
          animate={{ 
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
            borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ duration: 0.4 }}
          onClick={() => onMasterToggle(!masterSwitchOn)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-xl border flex-shrink-0"
          whileHover={{
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
          }}
          whileTap={{ scale: 0.92 }}
          aria-label="Toggle all lights"
        >
          <motion.div
            animate={{
              color: masterSwitchOn ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
            }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center"
          >
            <Power className="w-4 h-4" strokeWidth={2} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Devices Battery Section - Desktop only */}
      <motion.div 
        className="hidden md:block rounded-2xl py-6 px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 10
        }}
        transition={{
          ...smoothTransition,
          delay: 0.15,
        }}
      >
        {devices && devices.length > 0 && (
          <div className="flex flex-row gap-10">
            {devices.map((device, index) => {
              const DeviceIcon = device.icon === 'headphones' ? AirPodsMaxIcon : IPhoneIcon;
              
              return (
                <motion.div 
                  key={device.id} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ 
                    opacity: isLoaded ? 1 : 0,
                    y: isLoaded ? 0 : 8
                  }}
                  transition={{
                    ...smoothTransition,
                    delay: 0.2 + (index * 0.08),
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
                    delay={0.3 + (index * 0.1)}
                  >
                    <DeviceIcon className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                  </CircularProgress>
                  
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/55 font-light tracking-[0.2em] uppercase mb-1">
                      {device.name}
                    </span>
                    {/* Smooth crossfade between skeleton and value */}
                    <div className="relative h-5">
                      {/* Skeleton layer */}
                      <motion.div
                        className="absolute inset-0 h-5 w-12 bg-white/10 rounded"
                        initial={false}
                        animate={{ 
                          opacity: showSkeleton ? [0.3, 0.5, 0.3] : 0,
                        }}
                        transition={{
                          opacity: showSkeleton 
                            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                            : { duration: 0.4, ease: smoothTransition.ease }
                        }}
                      />
                      {/* Value layer */}
                      <motion.div 
                        className="text-base font-light text-white tabular-nums flex items-center gap-1.5"
                        initial={false}
                        animate={{ 
                          opacity: dataReady && !showSkeleton ? 1 : 0,
                        }}
                        transition={{ 
                          duration: 0.5,
                          ease: smoothTransition.ease,
                          delay: showSkeleton ? 0 : 0.1
                        }}
                      >
                        <span>{device.batteryLevel}%</span>
                        {device.isCharging && (
                          <Zap className="w-3.5 h-3.5 text-status-caution" fill="currentColor" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Light Controls Section */}
      <motion.div 
        className="space-y-2 md:mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ ...smoothTransition, delay: 0.2 }}
      >
        {lights.map((light, index) => (
          <motion.div 
            key={light.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ 
              opacity: isLoaded ? 1 : 0,
              y: isLoaded ? 0 : 12
            }}
            transition={{
              ...smoothTransition,
              delay: 0.25 + (index * 0.07),
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
      </motion.div>
    </motion.div>
  );
};
