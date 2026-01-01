import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Lightbulb, 
  Thermometer, 
  Droplets, 
  Wind, 
  Battery, 
  Speaker,
  ChevronLeft,
  Smartphone,
  Headphones,
  Tv,
  Lamp,
  SunMedium,
  MonitorSpeaker
} from "lucide-react";
import { HomeAssistantIcon } from "@/components/icons/HomeAssistantIcon";

// Animation constants matching Demo.tsx
const EASE = {
  apple: [0.25, 0.1, 0.25, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  spring: { type: "spring", stiffness: 300, damping: 30 } as const,
};

// Mock data for discovered devices
const MOCK_ROOMS = [
  { id: "all", name: "הכל", deviceCount: 24 },
  { id: "office", name: "משרד", deviceCount: 8 },
  { id: "living", name: "סלון", deviceCount: 6 },
  { id: "bedroom", name: "חדר שינה", deviceCount: 5 },
  { id: "kitchen", name: "מטבח", deviceCount: 5 },
];

interface Device {
  id: string;
  name: string;
  state: string;
  room: string;
  icon: React.ElementType;
}

const MOCK_DEVICES = {
  lights: [
    { id: "l1", name: "מנורת שולחן", state: "on", room: "office", icon: Lamp },
    { id: "l2", name: "תאורת מוניטור", state: "on", room: "office", icon: SunMedium },
    { id: "l3", name: "ספוט תקרה", state: "off", room: "office", icon: Lightbulb },
    { id: "l4", name: "מנורת סלון", state: "on", room: "living", icon: Lamp },
    { id: "l5", name: "תאורת אווירה", state: "off", room: "bedroom", icon: Lightbulb },
  ] as Device[],
  climate: [
    { id: "c1", name: "טמפרטורה", state: "23.5°C", room: "office", icon: Thermometer },
    { id: "c2", name: "לחות", state: "45%", room: "office", icon: Droplets },
    { id: "c3", name: "איכות אוויר", state: "טוב", room: "office", icon: Wind },
    { id: "c4", name: "טמפרטורה", state: "22.1°C", room: "living", icon: Thermometer },
    { id: "c5", name: "לחות", state: "52%", room: "bedroom", icon: Droplets },
  ] as Device[],
  sensors: [
    { id: "s1", name: "iPhone", state: "87%", room: "office", icon: Smartphone },
    { id: "s2", name: "AirPods Max", state: "64%", room: "office", icon: Headphones },
    { id: "s3", name: "iPad", state: "100%", room: "living", icon: Battery },
  ] as Device[],
  mediaPlayers: [
    { id: "m1", name: "HomePod", state: "פועל", room: "office", icon: Speaker },
    { id: "m2", name: "Apple TV", state: "כבוי", room: "living", icon: Tv },
    { id: "m3", name: "רמקול סלון", state: "כבוי", room: "living", icon: MonitorSpeaker },
  ] as Device[],
};

const CATEGORY_CONFIG = {
  lights: { 
    title: "תאורה", 
    icon: Lightbulb, 
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20"
  },
  climate: { 
    title: "אקלים", 
    icon: Thermometer, 
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20"
  },
  sensors: { 
    title: "סנסורים", 
    icon: Battery, 
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20"
  },
  mediaPlayers: { 
    title: "מדיה", 
    icon: Speaker, 
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20"
  },
};

// Room Pill Component
const RoomPill = ({ 
  room, 
  isActive, 
  onClick 
}: { 
  room: typeof MOCK_ROOMS[0]; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      relative px-4 py-2 rounded-full text-sm font-light whitespace-nowrap
      transition-colors duration-200
      ${isActive 
        ? "text-[#302A23]" 
        : "text-white/60 hover:text-white/80"
      }
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {isActive && (
      <motion.div
        layoutId="activeRoom"
        className="absolute inset-0 bg-white rounded-full"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}
    <span className="relative z-10">
      {room.name}
      <span className={`mr-1.5 text-xs ${isActive ? "text-[#302A23]/60" : "text-white/40"}`}>
        {room.deviceCount}
      </span>
    </span>
  </motion.button>
);

// Device Card Component
const DeviceCard = ({ 
  device, 
  category,
  index 
}: { 
  device: Device; 
  category: keyof typeof CATEGORY_CONFIG;
  index: number;
}) => {
  const config = CATEGORY_CONFIG[category];
  const isOn = device.state === "on" || device.state === "פועל";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ 
        duration: 0.35, 
        delay: index * 0.03,
        ease: EASE.apple 
      }}
      className={`
        group flex items-center gap-3 p-3 rounded-xl
        bg-white/5 hover:bg-white/8
        border border-white/5 hover:border-white/10
        transition-all duration-200 cursor-pointer
      `}
    >
      {/* Icon */}
      <div className={`
        w-9 h-9 rounded-lg flex items-center justify-center
        ${config.bgColor} ${config.borderColor} border
      `}>
        <device.icon className={`w-4 h-4 ${config.color}`} />
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/90 font-light truncate">
          {device.name}
        </div>
        <div className="text-xs text-white/40 font-light">
          {MOCK_ROOMS.find(r => r.id === device.room)?.name}
        </div>
      </div>
      
      {/* State */}
      <div className="flex items-center gap-2">
        {category === "lights" && (
          <div className={`
            w-2 h-2 rounded-full
            ${isOn ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-white/20"}
          `} />
        )}
        <span className={`
          text-xs font-light
          ${isOn ? "text-white/80" : "text-white/40"}
        `}>
          {device.state === "on" ? "פועל" : device.state === "off" ? "כבוי" : device.state}
        </span>
      </div>
    </motion.div>
  );
};

// Category Section Component
const CategorySection = ({ 
  category, 
  devices,
  index 
}: { 
  category: keyof typeof CATEGORY_CONFIG; 
  devices: Device[];
  index: number;
}) => {
  const config = CATEGORY_CONFIG[category];
  
  if (devices.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: 0.3 + index * 0.08,
        ease: EASE.apple 
      }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`
          w-6 h-6 rounded-md flex items-center justify-center
          ${config.bgColor}
        `}>
          <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
        <h3 className="text-sm font-light text-white/70 tracking-wide">
          {config.title}
        </h3>
        <span className="text-xs text-white/30 font-light">
          {devices.length}
        </span>
      </div>
      
      {/* Devices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <AnimatePresence mode="popLayout">
          {devices.map((device, i) => (
            <DeviceCard 
              key={device.id} 
              device={device} 
              category={category}
              index={i} 
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function DemoDiscovery() {
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState("all");
  
  // Filter devices by room
  const filterDevices = (devices: Device[]) => {
    if (activeRoom === "all") return devices;
    return devices.filter(d => d.room === activeRoom);
  };
  
  const filteredDevices = {
    lights: filterDevices(MOCK_DEVICES.lights),
    climate: filterDevices(MOCK_DEVICES.climate),
    sensors: filterDevices(MOCK_DEVICES.sensors),
    mediaPlayers: filterDevices(MOCK_DEVICES.mediaPlayers),
  };
  
  const totalDevices = Object.values(filteredDevices).flat().length;

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8"
      style={{ backgroundColor: "#A59587" }}
      dir="rtl"
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE.apple }}
        onClick={() => navigate("/demo")}
        className="
          absolute top-4 right-4 sm:top-8 sm:right-8
          flex items-center gap-1.5 text-white/60 hover:text-white/90
          text-sm font-light transition-colors
        "
      >
        <ChevronLeft className="w-4 h-4 rotate-180" />
        חזרה
      </motion.button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE.apple }}
        className="
          w-full max-w-2xl mt-12 sm:mt-16
          rounded-3xl p-6 sm:p-8
          bg-[#302A23] 
          outline outline-1 outline-white/10
          shadow-2xl
        "
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE.apple }}
          className="flex flex-col items-center text-center mb-8"
        >
          {/* HA Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE.apple }}
            className="
              w-14 h-14 rounded-2xl mb-4
              bg-gradient-to-br from-white via-white to-neutral-200
              flex items-center justify-center
              shadow-lg
            "
          >
            <HomeAssistantIcon className="w-8 h-8 text-[#18BCF2]" />
          </motion.div>
          
          <h1 className="text-xl sm:text-2xl font-light text-white/90 tracking-wide mb-1">
            הבית החכם שלך
          </h1>
          <p className="text-sm text-white/50 font-light">
            {totalDevices} מכשירים ב-{MOCK_ROOMS.length - 1} חדרים
          </p>
        </motion.div>

        {/* Room Pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE.apple }}
          className="
            flex gap-1 overflow-x-auto pb-4 mb-6
            scrollbar-none -mx-2 px-2
          "
          style={{ scrollbarWidth: "none" }}
        >
          {MOCK_ROOMS.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.04, ease: EASE.apple }}
            >
              <RoomPill
                room={room}
                isActive={activeRoom === room.id}
                onClick={() => setActiveRoom(room.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-6" />

        {/* Categories */}
        <div className="space-y-6">
          {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((category, i) => (
            <CategorySection
              key={category}
              category={category}
              devices={filteredDevices[category]}
              index={i}
            />
          ))}
        </div>

        {/* Footer Action */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: EASE.apple }}
          className="mt-8 pt-6 border-t border-white/5"
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate("/settings")}
            className="
              w-full py-3 rounded-xl
              bg-white/5 hover:bg-white/10
              border border-white/10 hover:border-white/15
              text-white/80 text-sm font-light
              transition-all duration-200
            "
          >
            הגדרת מכשירים
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Summary Footer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7, ease: EASE.apple }}
        className="
          mt-6 flex items-center gap-6
          text-white/40 text-xs font-light
        "
      >
        {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const count = MOCK_DEVICES[category].length;
          return (
            <div key={category} className="flex items-center gap-1.5">
              <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
              <span>{count}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}