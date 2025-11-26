import { motion } from "framer-motion";
import { Thermometer, Droplets } from "lucide-react";
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
  lights: Light[];
}

export const RoomInfoPanel = ({ roomName, temperature, humidity, lights }: RoomInfoPanelProps) => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.03, 0.26, 1] }}
    >
      {/* Room Title */}
      <div>
        <h1 className="text-5xl font-light tracking-wide text-foreground mb-1">
          {roomName}
        </h1>
        <div className="h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
      </div>

      {/* Climate Info */}
      <div className="flex gap-4">
        {/* Temperature */}
        <motion.div 
          className="flex-1 bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={16} className="text-white/40" />
            <span className="text-xs text-white/40 font-light tracking-widest uppercase">
              Temperature
            </span>
          </div>
          <div className="text-3xl font-light text-foreground tabular-nums">
            {temperature}°
          </div>
        </motion.div>

        {/* Humidity */}
        <motion.div 
          className="flex-1 bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={16} className="text-white/40" />
            <span className="text-xs text-white/40 font-light tracking-widest uppercase">
              Humidity
            </span>
          </div>
          <div className="text-3xl font-light text-foreground tabular-nums">
            {humidity}%
          </div>
        </motion.div>
      </div>

      {/* Light Controls Section */}
      <div>
        <h2 className="text-xs font-light text-white/40 mb-3 tracking-widest uppercase">
          Lighting
        </h2>
        <motion.div 
          className="space-y-2"
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
          {lights.map((light) => (
            <motion.div
              key={light.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
            >
              <LightControlCard
                id={light.id}
                label={light.label}
                intensity={light.intensity}
                onChange={light.onChange}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
