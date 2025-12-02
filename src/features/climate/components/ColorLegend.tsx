import { motion } from "framer-motion";

interface ColorLegendProps {
  colorType: 'temperature' | 'humidity' | 'airQuality';
}

const legendData = {
  temperature: [
    { color: 'hsl(200 70% 55%)', label: '≤17°', name: 'Cold' },
    { color: 'hsl(180 60% 50%)', label: '18-20°', name: 'Cool' },
    { color: 'hsl(142 70% 45%)', label: '20-24°', name: 'Comfort' },
    { color: 'hsl(35 90% 55%)', label: '24-28°', name: 'Warm' },
    { color: 'hsl(0 75% 55%)', label: '>28°', name: 'Hot' },
  ],
  humidity: [
    { color: 'hsl(0 75% 55%)', label: '<30%', name: 'Dry' },
    { color: 'hsl(44 85% 58%)', label: '30-40%', name: 'Low' },
    { color: 'hsl(142 70% 45%)', label: '40-60%', name: 'Optimal' },
    { color: 'hsl(44 85% 58%)', label: '60-70%', name: 'High' },
    { color: 'hsl(0 75% 55%)', label: '>70%', name: 'Humid' },
  ],
  airQuality: [
    { color: 'hsl(142 70% 45%)', label: '≤12', name: 'Good' },
    { color: 'hsl(44 85% 58%)', label: '13-35', name: 'Moderate' },
    { color: 'hsl(35 90% 55%)', label: '36-55', name: 'Sensitive' },
    { color: 'hsl(0 75% 55%)', label: '>55', name: 'Unhealthy' },
  ],
};

export const ColorLegend = ({ colorType }: ColorLegendProps) => {
  const items = legendData[colorType];

  return (
    <motion.div
      className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.name}
          className="flex flex-col items-center gap-0.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 + index * 0.05, duration: 0.25 }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[9px] text-white/40 font-light whitespace-nowrap">
            {item.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};
