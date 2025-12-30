import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { LightControlCard } from "@/features/lighting/components/LightControlCard";
import { AirPodsMaxIcon } from "./icons/AirPodsMaxIcon";
import { IPhoneIcon } from "./icons/IPhoneIcon";
import { MagicKeyboardIcon } from "./icons/MagicKeyboardIcon";
import { MagicMouseIcon } from "./icons/MagicMouseIcon";
import { CircularProgress } from "@/features/climate/components/CircularProgress";
import { LOAD_SEQUENCE } from "@/constants/loadingSequence";

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

// Device battery indicator size
const DEVICE_SIZE = 62;
const DEVICE_STROKE = 2.5;

// Get timings from centralized config
const elements = LOAD_SEQUENCE.elements;
const contentEase = LOAD_SEQUENCE.content.ease;

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
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          y: isLoaded ? 0 : 10,
        }}
        transition={{
          duration: elements.roomTitle.duration,
          ease: contentEase,
          delay: elements.roomTitle.delay,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <h1 className="text-xl md:text-3xl font-display tracking-tight text-foreground leading-tight">
          {roomName}
        </h1>
        
        {/* Master Switch */}
        <motion.button
          initial={false}
          animate={{ 
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
            borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
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
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
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
            duration: elements.devices.duration,
            ease: contentEase,
            delay: elements.devices.delay,
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
                    duration: elements.devices.duration,
                    ease: contentEase,
                    delay: elements.devices.delay + (index * elements.devices.stagger),
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
                    delay={LOAD_SEQUENCE.finishing.progressRings.delay + (index * 0.12)}
                    gapAngle={60}
                    showPercentage={true}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0,
                y: isLoaded ? 0 : 8,
              }}
              transition={{
                duration: elements.lightCards.duration,
                ease: contentEase,
                delay: elements.lightCards.delay + (index * elements.lightCards.stagger),
              }}
              style={{ willChange: 'opacity, transform' }}
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
