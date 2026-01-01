import { useState, useEffect } from "react";
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
  ChevronDown,
  Smartphone,
  Headphones,
  Tv,
  Lamp,
  SunMedium,
  MonitorSpeaker,
  Scan,
  Check
} from "lucide-react";
import { HomeAssistantIcon } from "@/components/icons/HomeAssistantIcon";

// Animation constants
const EASE = {
  apple: [0.25, 0.1, 0.25, 1] as const,
};

// Mock data for discovered devices
const MOCK_ROOMS = [
  { id: "all", name: "All", deviceCount: 24 },
  { id: "office", name: "Office", deviceCount: 8 },
  { id: "living", name: "Living Room", deviceCount: 6 },
  { id: "bedroom", name: "Bedroom", deviceCount: 5 },
  { id: "kitchen", name: "Kitchen", deviceCount: 5 },
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
    { id: "l1", name: "Desk Lamp", state: "on", room: "office", icon: Lamp },
    { id: "l2", name: "Monitor Light Bar", state: "on", room: "office", icon: SunMedium },
    { id: "l3", name: "Ceiling Spotlight", state: "off", room: "office", icon: Lightbulb },
    { id: "l4", name: "Floor Lamp", state: "on", room: "living", icon: Lamp },
    { id: "l5", name: "Bedside Light", state: "off", room: "bedroom", icon: Lightbulb },
  ] as Device[],
  climate: [
    { id: "c1", name: "Office Temperature", state: "23.5°C", room: "office", icon: Thermometer },
    { id: "c2", name: "Office Humidity", state: "45%", room: "office", icon: Droplets },
    { id: "c3", name: "Air Quality Index", state: "Good", room: "office", icon: Wind },
    { id: "c4", name: "Living Room Temp", state: "22.1°C", room: "living", icon: Thermometer },
    { id: "c5", name: "Bedroom Humidity", state: "52%", room: "bedroom", icon: Droplets },
  ] as Device[],
  sensors: [
    { id: "s1", name: "iPhone 15 Pro", state: "87%", room: "office", icon: Smartphone },
    { id: "s2", name: "AirPods Max", state: "64%", room: "office", icon: Headphones },
    { id: "s3", name: "iPad Pro", state: "100%", room: "living", icon: Battery },
  ] as Device[],
  mediaPlayers: [
    { id: "m1", name: "HomePod mini", state: "Playing", room: "office", icon: Speaker },
    { id: "m2", name: "Apple TV 4K", state: "Idle", room: "living", icon: Tv },
    { id: "m3", name: "Sonos One", state: "Idle", room: "living", icon: MonitorSpeaker },
  ] as Device[],
};

const CATEGORY_CONFIG = {
  lights: { 
    title: "Lighting", 
    icon: Lightbulb, 
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20"
  },
  climate: { 
    title: "Climate", 
    icon: Thermometer, 
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20"
  },
  sensors: { 
    title: "Devices", 
    icon: Battery, 
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20"
  },
  mediaPlayers: { 
    title: "Media", 
    icon: Speaker, 
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20"
  },
};

// Scanning phase data
const SCAN_STEPS = [
  { label: "Connecting to Home Assistant...", duration: 800 },
  { label: "Discovering devices...", duration: 1200 },
  { label: "Fetching entity states...", duration: 1000 },
  { label: "Organizing by rooms...", duration: 600 },
];

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
  const isOn = device.state === "on" || device.state === "Playing";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ 
        duration: 0.25, 
        delay: index * 0.025,
        ease: EASE.apple 
      }}
      className="
        group flex items-center gap-3 p-3 rounded-xl
        bg-white/5 hover:bg-white/8
        border border-white/5 hover:border-white/10
        transition-all duration-200 cursor-pointer
      "
    >
      <div className={`
        w-9 h-9 rounded-lg flex items-center justify-center
        ${config.bgColor} ${config.borderColor} border
      `}>
        <device.icon className={`w-4 h-4 ${config.color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/90 font-light truncate">
          {device.name}
        </div>
        <div className="text-xs text-white/40 font-light">
          {MOCK_ROOMS.find(r => r.id === device.room)?.name}
        </div>
      </div>
      
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
          {device.state === "on" ? "On" : device.state === "off" ? "Off" : device.state}
        </span>
      </div>
    </motion.div>
  );
};

// Collapsible Category Section
const CategorySection = ({ 
  category, 
  devices,
  index,
  defaultOpen = false
}: { 
  category: keyof typeof CATEGORY_CONFIG; 
  devices: Device[];
  index: number;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = CATEGORY_CONFIG[category];
  
  if (devices.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.35, 
        delay: 0.1 + index * 0.06,
        ease: EASE.apple 
      }}
      className="overflow-hidden"
    >
      {/* Header - Clickable */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between gap-2 p-3 rounded-xl
          bg-white/[0.03] hover:bg-white/[0.06]
          border border-white/5
          transition-all duration-200
        "
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${config.bgColor}
          `}>
            <config.icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-light text-white/90">
              {config.title}
            </h3>
            <span className="text-xs text-white/40 font-light">
              {devices.length} {devices.length === 1 ? "device" : "devices"}
            </span>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASE.apple }}
        >
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </motion.button>
      
      {/* Devices List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE.apple }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {devices.map((device, i) => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  category={category}
                  index={i} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Scanning Phase Component
const ScanningPhase = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (currentStep < SCAN_STEPS.length) {
      const step = SCAN_STEPS[currentStep];
      const startProgress = (currentStep / SCAN_STEPS.length) * 100;
      const endProgress = ((currentStep + 1) / SCAN_STEPS.length) * 100;
      
      // Animate progress
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / step.duration, 1);
        setProgress(startProgress + (endProgress - startProgress) * p);
        
        if (p < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
      
      timeout = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, step.duration);
    } else {
      // Complete
      setTimeout(onComplete, 400);
    }
    
    return () => clearTimeout(timeout);
  }, [currentStep, onComplete]);
  
  const isComplete = currentStep >= SCAN_STEPS.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: EASE.apple }}
      className="flex flex-col items-center text-center py-12"
    >
      {/* Scanning Icon */}
      <motion.div
        animate={isComplete ? { scale: [1, 1.1, 1] } : { rotate: 360 }}
        transition={isComplete 
          ? { duration: 0.4, ease: EASE.apple }
          : { duration: 2, repeat: Infinity, ease: "linear" }
        }
        className={`
          w-16 h-16 rounded-2xl mb-6
          flex items-center justify-center
          ${isComplete ? "bg-green-500/20" : "bg-white/5"}
          border ${isComplete ? "border-green-500/30" : "border-white/10"}
        `}
      >
        {isComplete ? (
          <Check className="w-8 h-8 text-green-400" />
        ) : (
          <Scan className="w-8 h-8 text-white/60" />
        )}
      </motion.div>
      
      {/* Status Text */}
      <motion.p
        key={currentStep}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-white/70 font-light mb-6"
      >
        {isComplete ? "Discovery complete!" : SCAN_STEPS[currentStep]?.label}
      </motion.p>
      
      {/* Progress Bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white/60 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      
      {/* Device Count Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: currentStep >= 2 ? 1 : 0 }}
        className="mt-6 flex items-center gap-4 text-white/40 text-xs font-light"
      >
        {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const count = MOCK_DEVICES[cat].length;
          return (
            <div key={cat} className="flex items-center gap-1">
              <config.icon className={`w-3 h-3 ${config.color}`} />
              <span>{count}</span>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default function DemoDiscovery() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"scanning" | "results">("scanning");
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
  
  const totalDevices = Object.values(MOCK_DEVICES).flat().length;

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-8"
      style={{ backgroundColor: "#A59587" }}
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE.apple }}
        onClick={() => navigate("/demo")}
        className="
          absolute top-4 left-4 sm:top-8 sm:left-8
          flex items-center gap-1.5 text-white/60 hover:text-white/90
          text-sm font-light transition-colors
        "
      >
        <ChevronLeft className="w-4 h-4" />
        Back
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
          className="flex flex-col items-center text-center mb-6"
        >
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
            {phase === "scanning" ? "Discovering Devices" : "Your Smart Home"}
          </h1>
          {phase === "results" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/50 font-light"
            >
              {totalDevices} devices in {MOCK_ROOMS.length - 1} rooms
            </motion.p>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "scanning" ? (
            <ScanningPhase 
              key="scanning"
              onComplete={() => setPhase("results")} 
            />
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE.apple }}
            >
              {/* Room Pills */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE.apple }}
                className="
                  flex gap-1 overflow-x-auto pb-4 mb-4
                  scrollbar-none -mx-2 px-2
                "
                style={{ scrollbarWidth: "none" }}
              >
                {MOCK_ROOMS.map((room, i) => (
                  <motion.button
                    key={room.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03, ease: EASE.apple }}
                    onClick={() => setActiveRoom(room.id)}
                    className={`
                      relative px-4 py-2 rounded-full text-sm font-light whitespace-nowrap
                      transition-colors duration-200
                      ${activeRoom === room.id 
                        ? "text-[#302A23]" 
                        : "text-white/60 hover:text-white/80"
                      }
                    `}
                  >
                    {activeRoom === room.id && (
                      <motion.div
                        layoutId="activeRoom"
                        className="absolute inset-0 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {room.name}
                      <span className={`ml-1.5 text-xs ${activeRoom === room.id ? "text-[#302A23]/60" : "text-white/40"}`}>
                        {room.deviceCount}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Divider */}
              <div className="h-px bg-white/5 mb-4" />

              {/* Categories - Collapsible */}
              <div className="space-y-3">
                {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((category, i) => (
                  <CategorySection
                    key={category}
                    category={category}
                    devices={filteredDevices[category]}
                    index={i}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>

              {/* Footer Action */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.4, ease: EASE.apple }}
                className="mt-6 pt-4 border-t border-white/5"
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
                  Configure Devices
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Summary Footer */}
      {phase === "results" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: EASE.apple }}
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
      )}
    </div>
  );
}