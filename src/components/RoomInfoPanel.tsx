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
        <h1 className="text-4xl font-display font-light tracking-wide text-foreground">
          {roomName}
        </h1>
      </div>

      {/* Climate Info */}
      <div className="flex gap-8">
        {/* Temperature */}
        <div className="flex-1 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={16} className="text-white/40" />
            <span className="text-xs text-white/40 font-light tracking-widest uppercase">
              Temperature
            </span>
          </div>
          <div className="text-2xl font-light text-white/90 tabular-nums">
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
          <div className="text-2xl font-light text-white/90 tabular-nums">
            {humidity}%
          </div>
        </div>
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
