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
}

export const RoomInfoPanel = ({ roomName, masterSwitchOn, onMasterToggle, onLightHover, lights, devices, isLoaded }: RoomInfoPanelProps) => {
  const { header, masterSwitch, devices: devicesAnim, lightCards } = PAGE_LOAD_SEQUENCE;

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Room Title with Master Switch */}
      <motion.div 
        className="flex items-center justify-between gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ 
          duration: header.duration,
          delay: header.delay,
          ease: header.ease
        }}
        style={{ willChange: 'opacity' }}
      >
        <h1 className="text-2xl md:text-4xl font-display font-light tracking-tight text-foreground leading-tight">
          {roomName}
        </h1>
        
        {/* Master Switch - Circular Frosted Glass Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            backgroundColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
            borderColor: masterSwitchOn ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
          }}
          transition={{ 
            opacity: {
              duration: masterSwitch.duration,
              delay: masterSwitch.delay,
              ease: masterSwitch.ease
            },
            backgroundColor: { duration: 0.3 },
            borderColor: { duration: 0.3 }
          }}
          onClick={() => onMasterToggle(!masterSwitchOn)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-xl border transition-colors duration-300 flex-shrink-0"
          style={{ willChange: 'opacity' }}
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
      </motion.div>

      {/* Devices Battery Section - Desktop only */}
      <motion.div
        className="hidden md:block rounded-2xl py-6 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ 
          duration: devicesAnim.duration,
          delay: devicesAnim.delay,
          ease: devicesAnim.ease
        }}
        style={{ willChange: 'opacity' }}
      >
        {/* Devices Battery Section */}
        {devices && devices.length > 0 && (
          <div className="flex flex-row gap-10">
            {devices.map((device, index) => {
              const DeviceIcon = device.icon === 'headphones' ? AirPodsMaxIcon : IPhoneIcon;
              
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
                    delay={PAGE_LOAD_SEQUENCE.circularProgress.delay + (index * 0.15)}
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
                        <Zap className="w-3.5 h-3.5 text-status-caution" fill="currentColor" />
                      )}
                    </div>
                  </div>
                </div>
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
        transition={{ 
          duration: lightCards.duration,
          delay: lightCards.delay,
          ease: lightCards.ease
        }}
        style={{ willChange: 'opacity' }}
      >
        {lights.map((light, index) => (
          <motion.div
            key={light.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ 
              duration: lightCards.duration,
              delay: lightCards.delay + (index * lightCards.stagger),
              ease: lightCards.ease
            }}
            style={{ willChange: 'opacity' }}
          >
            <LightControlCard
              id={light.id}
              label={light.label}
              intensity={light.intensity}
              isPending={light.isPending}
              isLoading={light.isLoading}
              onChange={light.onChange}
              onHover={(isHovered) => onLightHover(isHovered ? light.id : null)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};