import { motion } from "framer-motion";
import { LightControlCard } from "./LightControlCard";

interface Light {
  id: string;
  label: string;
  intensity: number;
  onChange: (intensity: number) => void;
}

interface RoomInfoPanelProps {
  lights: Light[];
}

export const RoomInfoPanel = ({ lights }: RoomInfoPanelProps) => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.03, 0.26, 1] }}
    >
      {/* Divider Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Light Controls Section */}
      <div>
        <h2 className="text-sm font-light text-white/50 mb-6 tracking-[0.3em] uppercase">
          Lighting
        </h2>
        <motion.div 
          className="space-y-3"
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
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />
              )}
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
