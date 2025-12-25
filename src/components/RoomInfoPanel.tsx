import { motion } from "framer-motion";
import { Power, Zap } from "lucide-react";
import { LightControlCard } from "@/features/lighting/components/LightControlCard";
import { AirPodsMaxIcon } from "./icons/AirPodsMaxIcon";
import { IPhoneIcon } from "./icons/IPhoneIcon";
import { MagicKeyboardIcon } from "./icons/MagicKeyboardIcon";
import { MagicMouseIcon } from "./icons/MagicMouseIcon";
import { HomeAssistantIcon } from "./icons/HomeAssistantIcon";
import { PAGE_LOAD, DATA_TRANSITION, EASING } from "@/constants/animations";

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

// Unified transition config
const entryTransition = {
  duration: PAGE_LOAD.container.duration,
  ease: EASING.entrance,
};

const crossfadeTransition = {
  duration: DATA_TRANSITION.dataEnter.duration,
  ease: EASING.smooth,
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
    <div className="space-y-4 md:space-y-8">
      {/* Room Title with Master Switch */}
      <motion.div 
        className="flex items-center justify-between gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{
          duration: PAGE_LOAD.elements.header.duration,
          ease: EASING.entrance,
          delay: PAGE_LOAD.elements.header.delay,
        }}
        style={{ willChange: 'opacity' }}
      >
        <div className="flex items-center gap-3">
          <HomeAssistantIcon className="w-8 h-8 md:w-10 md:h-10 text-white/90" />
          <h1 className="text-2xl md:text-4xl font-display font-light tracking-tight text-foreground leading-tight">
            {roomName}
          </h1>
        </div>
        
        {/* Master Switch */}
        <motion.button
          initial={false}
          animate={{ 
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
            borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ duration: 0.4, ease: EASING.smooth }}
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
            transition={{ duration: 0.4, ease: EASING.smooth }}
            className="flex items-center justify-center"
          >
            <Power className="w-4 h-4" strokeWidth={2} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Devices Battery Section - Desktop only */}
      {devices && devices.length > 0 && (
        <div className="hidden md:block py-4">
          <div className="flex flex-row items-start justify-between px-4">
            {devices.map((device, index) => {
              const DeviceIcon = device.icon === 'headphones' 
                ? AirPodsMaxIcon 
                : device.icon === 'keyboard'
                ? MagicKeyboardIcon
                : device.icon === 'mouse'
                ? MagicMouseIcon
                : IPhoneIcon;
              
              return (
                <div key={device.id} className="flex items-start">
                  <motion.div 
                    className="flex flex-col gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{
                      duration: PAGE_LOAD.elements.devices.duration,
                      ease: EASING.entrance,
                      delay: PAGE_LOAD.elements.devices.delay + (index * PAGE_LOAD.elements.devices.stagger),
                    }}
                    style={{ willChange: 'opacity' }}
                  >
                    {/* Row 1: Icon + Battery % */}
                    <div className="relative h-7">
                      {/* Skeleton layer */}
                      <motion.div
                        className="absolute inset-0 h-7 w-16 bg-white/10 rounded"
                        initial={false}
                        animate={{ 
                          opacity: showSkeleton ? [0.3, 0.5, 0.3] : 0,
                        }}
                        transition={showSkeleton ? {
                          duration: DATA_TRANSITION.skeleton.shimmerDuration,
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
                          filter: dataReady && !showSkeleton ? 'blur(0px)' : `blur(${DATA_TRANSITION.dataEnter.blur}px)`,
                        }}
                        transition={{ 
                          ...crossfadeTransition,
                          delay: showSkeleton ? 0 : DATA_TRANSITION.dataEnter.delay,
                        }}
                      >
                        <DeviceIcon className="w-5 h-5 text-white/50" strokeWidth={1.5} />
                        <span className="text-xl font-light text-white tabular-nums">{device.batteryLevel}%</span>
                        {device.isCharging && (
                          <Zap className="w-3.5 h-3.5 text-status-caution" fill="currentColor" />
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Row 2: Device Name */}
                    <span className="text-[10px] text-white/40 font-light tracking-[0.15em] uppercase whitespace-nowrap">
                      {device.name}
                    </span>
                  </motion.div>
                  
                  {/* Separator line - show for all except last item */}
                  {index < devices.length - 1 && (
                    <div className="h-10 w-px bg-white/10 ml-8" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Light Controls Section */}
      <div className="space-y-2 md:mt-6">
        {lights.map((light, index) => (
          <motion.div 
            key={light.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{
              duration: PAGE_LOAD.elements.lightCards.duration,
              ease: EASING.entrance,
              delay: PAGE_LOAD.elements.lightCards.delay + (index * PAGE_LOAD.elements.lightCards.stagger),
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
  );
};
