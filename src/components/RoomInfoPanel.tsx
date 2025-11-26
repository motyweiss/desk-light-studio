import { motion } from "framer-motion";
import { Thermometer, Droplets, Power } from "lucide-react";
import { LightControlCard } from "./LightControlCard";

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
}

export const RoomInfoPanel = ({ roomName, temperature, humidity, masterSwitchOn, onMasterToggle, onLightHover, lights }: RoomInfoPanelProps) => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.03, 0.26, 1] }}
    >
      {/* Room Title with Master Switch */}
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-display font-light tracking-wide text-foreground">
          {roomName}
        </h1>
        
        {/* Master Switch - Circular Frosted Glass Button */}
        <motion.button
          onClick={() => onMasterToggle(!masterSwitchOn)}
          className={`w-12 h-12 rounded-full backdrop-blur-xl border transition-all duration-500 ${
            masterSwitchOn 
              ? 'bg-[hsl(38_70%_58%/0.25)] border-[hsl(38_70%_58%/0.4)]' 
              : 'bg-white/8 border-white/15 hover:bg-white/12'
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
            <Power size={20} strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      </div>

      {/* Climate Info */}
      <div className="flex gap-6">
        {/* Temperature */}
        <div className="flex-1 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={16} className="text-white/40" />
            <span className="text-xs text-white/40 font-light tracking-widest uppercase">
              Temperature
            </span>
          </div>
          <div className="text-xl font-light text-white/90 tabular-nums">
            {temperature}°
          </div>
        </div>

        {/* Humidity */}
        <div className="flex-1 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={16} className="text-white/40" />
            <span className="text-xs text-white/40 font-light tracking-widest uppercase">
              Humidity
            </span>
          </div>
          <div className="text-xl font-light text-white/90 tabular-nums">
            {humidity}%
          </div>
        </div>
      </div>

      {/* Light Controls Section */}
      <div>
        {/* Separator */}
        <div className="h-px bg-white/10 mb-5" />
        
        <motion.div 
          className="space-y-3 -ml-5"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {lights.map((light, index) => (
            <motion.div
              key={light.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
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
    </motion.div>
  );
};
