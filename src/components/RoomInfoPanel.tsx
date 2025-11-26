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
      className="space-y-8"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.03, 0.26, 1] }}
    >
      {/* Room Title */}
      <div>
        <h1 className="text-4xl font-light tracking-wide text-foreground mb-2">
          {roomName}
        </h1>
        <div className="h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
      </div>

      {/* Climate Info */}
      <div className="flex gap-6">
        {/* Temperature */}
        <motion.div 
          className="flex-1 bg-white/8 backdrop-blur-xl rounded-2xl p-5 border border-white/15"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Thermometer size={20} className="text-warm-glow-soft" />
            <span className="text-sm text-muted-foreground font-light tracking-wider">
              TEMPERATURE
            </span>
          </div>
          <div className="text-3xl font-light text-foreground">
            {temperature}°C
          </div>
        </motion.div>

        {/* Humidity */}
        <motion.div 
          className="flex-1 bg-white/8 backdrop-blur-xl rounded-2xl p-5 border border-white/15"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Droplets size={20} className="text-blue-400" />
            <span className="text-sm text-muted-foreground font-light tracking-wider">
              HUMIDITY
            </span>
          </div>
          <div className="text-3xl font-light text-foreground">
            {humidity}%
          </div>
        </motion.div>
      </div>

      {/* Light Controls Section */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4 tracking-wide">
          Light Controls
        </h2>
        <motion.div 
          className="space-y-3"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
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
                hidden: { opacity: 0, y: 20 },
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
