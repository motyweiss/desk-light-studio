import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { LightControlCard } from "@/features/lighting/components/LightControlCard";
import { AirPodsMaxIcon } from "./icons/AirPodsMaxIcon";
import { IPhoneIcon } from "./icons/IPhoneIcon";
import { MagicKeyboardIcon } from "./icons/MagicKeyboardIcon";
import { MagicMouseIcon } from "./icons/MagicMouseIcon";
import { CircularProgress } from "@/features/climate/components/CircularProgress";
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

// Device battery indicator size
const DEVICE_SIZE = 56;
const DEVICE_STROKE = 3;

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
    <div className="space-y-5 md:space-y-7">
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

      {/* Devices Battery Section - Desktop only - macOS Widget Style */}
      {devices && devices.length > 0 && (
        <motion.div 
          className="hidden md:block pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{
            duration: TIMING.medium,
            ease: EASE.entrance,
            delay: DELAY.short,
          }}
        >
          <div className="flex flex-row items-center justify-start gap-7">
            {devices.map((device, index) => {
              const DeviceIcon = device.icon === 'headphones' 
                ? AirPodsMaxIcon 
                : device.icon === 'keyboard'
                ? MagicKeyboardIcon
                : device.icon === 'mouse'
                ? MagicMouseIcon
                : IPhoneIcon;
              
              return (
                <motion.div 
                  key={device.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: isLoaded ? 1 : 0,
                    scale: isLoaded ? 1 : 0.9,
                  }}
                  transition={{
                    duration: TIMING.medium,
                    ease: EASE.entrance,
                    delay: DELAY.medium + (index * STAGGER.relaxed),
                  }}
                >
                  <CircularProgress
                    value={device.batteryLevel}
                    max={100}
                    min={0}
                    size={DEVICE_SIZE}
                    strokeWidth={DEVICE_STROKE}
                    isLoaded={dataReady}
                    showSkeleton={showSkeleton}
                    colorType="battery"
                    delay={0.3 + (index * 0.12)}
                    gapAngle={60}
                  >
                    <DeviceIcon className="w-6 h-6 text-white/70" />
                  </CircularProgress>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
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
