import { motion } from "framer-motion";
import { Power, Zap } from "lucide-react";
import { LightControlCard } from "@/features/lighting/components/LightControlCard";
import { AirPodsMaxIcon } from "./icons/AirPodsMaxIcon";
import { IPhoneIcon } from "./icons/IPhoneIcon";
import { MagicKeyboardIcon } from "./icons/MagicKeyboardIcon";
import { MagicMouseIcon } from "./icons/MagicMouseIcon";
import { AnimatedCounter } from "./AnimatedCounter";
import { TIMING, EASE, STAGGER, DELAY } from "@/lib/animations";

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
  icon?: 'smartphone' | 'headphones' | 'keyboard' | 'mouse';
}

interface ClimateData {
  temperature: number;
  humidity: number;
  airQuality: number;
  isLoaded: boolean;
}

interface RoomInfoPanelProps {
  roomName: string;
  masterSwitchOn: boolean;
  onMasterToggle: (checked: boolean) => void;
  onLightHover: (lightId: string | null) => void;
  lights: Light[];
  devices?: Device[];
  climateData?: ClimateData;
  isLoaded: boolean;
  showSkeleton?: boolean;
  dataReady?: boolean;
}

// Unified transition configs using centralized tokens
const entryTransition = {
  duration: TIMING.medium,
  ease: EASE.entrance,
};

const crossfadeTransition = {
  duration: TIMING.fast,
  ease: EASE.smooth,
};

export const RoomInfoPanel = ({ 
  roomName, 
  masterSwitchOn, 
  onMasterToggle, 
  onLightHover, 
  lights, 
  devices,
  climateData,
  isLoaded,
  showSkeleton = false,
  dataReady = true
}: RoomInfoPanelProps) => {

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Room Title with Master Switch */}
      <motion.div 
        className="flex items-center justify-between gap-3 md:gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{
          duration: TIMING.medium,
          ease: EASE.entrance,
          delay: DELAY.none,
        }}
        style={{ willChange: 'opacity' }}
      >
        <h1 className="text-xl md:text-3xl font-sans font-light tracking-tight text-foreground leading-tight">
          {roomName}
        </h1>
        
        {/* Master Switch */}
        <motion.button
          initial={false}
          animate={{ 
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
            borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ duration: TIMING.medium, ease: EASE.smooth }}
          onClick={() => onMasterToggle(!masterSwitchOn)}
          className="w-8 h-8 md:w-9 md:h-9 rounded-full backdrop-blur-xl border flex-shrink-0"
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
            transition={{ duration: TIMING.medium, ease: EASE.smooth }}
            className="flex items-center justify-center"
          >
            <Power className="w-4 h-4" strokeWidth={2} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Devices Battery Section - Desktop only */}
      {devices && devices.length > 0 && (
        <div className="hidden md:block">
          <div className="flex flex-row items-start justify-start gap-6">
            {devices.map((device, index) => {
              const DeviceIcon = device.icon === 'headphones' 
                ? AirPodsMaxIcon 
                : device.icon === 'keyboard'
                ? MagicKeyboardIcon
                : device.icon === 'mouse'
                ? MagicMouseIcon
                : IPhoneIcon;
              
              return (
                <div key={device.id} className="flex items-stretch gap-3">
                  <motion.div 
                    className="flex flex-col gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{
                      duration: TIMING.medium,
                      ease: EASE.entrance,
                      delay: DELAY.short + (index * STAGGER.relaxed),
                    }}
                    style={{ willChange: 'opacity' }}
                  >
                    {/* Row 1: Icon + Battery % */}
                    <div className="relative h-6">
                      {/* Skeleton layer */}
                      <motion.div
                        className="absolute inset-0 h-6 w-14 bg-white/10 rounded"
                        initial={false}
                        animate={{ 
                          opacity: showSkeleton ? [0.3, 0.5, 0.3] : 0,
                        }}
                        transition={showSkeleton ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : crossfadeTransition}
                      />
                      {/* Value layer */}
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={false}
                        animate={{ 
                          opacity: dataReady && !showSkeleton ? 1 : 0,
                          filter: dataReady && !showSkeleton ? 'blur(0px)' : 'blur(4px)',
                        }}
                        transition={{ 
                          ...crossfadeTransition,
                          delay: showSkeleton ? 0 : DELAY.minimal,
                        }}
                      >
                        <DeviceIcon className="w-5 h-5 text-white/60" />
                        <AnimatedCounter 
                          value={device.batteryLevel} 
                          suffix="%" 
                          isActive={dataReady && !showSkeleton}
                          delay={0.4 + (index * 0.15)}
                          className="text-base font-sans font-normal text-white tabular-nums tracking-tight"
                          suffixClassName="text-[10px] text-white/40 ml-0.5 font-light"
                        />
                        {device.isCharging && (
                          <Zap className="w-3.5 h-3.5 text-status-caution" fill="currentColor" />
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Row 2: Device Name */}
                    <span className="text-[9px] text-white/40 font-light tracking-[0.12em] uppercase whitespace-nowrap">
                      {device.name}
                    </span>
                  </motion.div>
                  
                  {/* Separator line */}
                  {index < devices.length - 1 && (
                    <div className="self-stretch w-px bg-white/10 ml-3" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Light Controls Section - 3 Column Grid */}
      <div className="pt-4 md:pt-6">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {lights.map((light, index) => (
            <motion.div 
              key={light.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{
                duration: TIMING.medium,
                ease: EASE.entrance,
                delay: DELAY.medium + (index * STAGGER.normal),
              }}
              style={{ willChange: 'opacity' }}
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
      </div>
    </div>
  );
};
