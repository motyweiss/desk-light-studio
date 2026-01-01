import { useState, useEffect, useCallback } from "react";
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
  Tv,
  Lamp,
  SunMedium,
  Check,
  AlertCircle,
  type LucideIcon
} from "lucide-react";
import { HomeAssistantIcon } from "@/components/icons/HomeAssistantIcon";
import { useHAConnection } from "@/contexts/HAConnectionContext";
import { haProxyClient } from "@/services/haProxyClient";

// Animation constants
const EASE = {
  apple: [0.25, 0.1, 0.25, 1] as const,
};

interface HAEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    device_class?: string;
    unit_of_measurement?: string;
    brightness?: number;
    [key: string]: unknown;
  };
}

interface Device {
  id: string;
  name: string;
  state: string;
  entityId: string;
  domain: string;
  deviceClass?: string;
}

interface CategoryData {
  title: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  devices: Device[];
}

// Scanning phase steps
const SCAN_STEPS = [
  "Connecting to Home Assistant",
  "Fetching entities",
  "Organizing devices",
];

// Mock entities for demo fallback
const MOCK_ENTITIES: HAEntity[] = [
  { entity_id: "light.living_room", state: "on", attributes: { friendly_name: "Living Room Light", brightness: 255 } },
  { entity_id: "light.bedroom", state: "off", attributes: { friendly_name: "Bedroom Light" } },
  { entity_id: "light.kitchen", state: "on", attributes: { friendly_name: "Kitchen Light", brightness: 180 } },
  { entity_id: "light.desk_lamp", state: "on", attributes: { friendly_name: "Desk Lamp", brightness: 200 } },
  { entity_id: "light.monitor_light", state: "on", attributes: { friendly_name: "Monitor Light Bar", brightness: 150 } },
  { entity_id: "sensor.living_room_temperature", state: "22.5", attributes: { friendly_name: "Living Room Temperature", device_class: "temperature", unit_of_measurement: "°C" } },
  { entity_id: "sensor.bedroom_temperature", state: "21.0", attributes: { friendly_name: "Bedroom Temperature", device_class: "temperature", unit_of_measurement: "°C" } },
  { entity_id: "sensor.living_room_humidity", state: "45", attributes: { friendly_name: "Living Room Humidity", device_class: "humidity", unit_of_measurement: "%" } },
  { entity_id: "sensor.air_quality", state: "Good", attributes: { friendly_name: "Air Quality Index", device_class: "aqi" } },
  { entity_id: "sensor.iphone_battery", state: "87", attributes: { friendly_name: "iPhone 15 Pro", device_class: "battery", unit_of_measurement: "%" } },
  { entity_id: "sensor.airpods_battery", state: "64", attributes: { friendly_name: "AirPods Max", device_class: "battery", unit_of_measurement: "%" } },
  { entity_id: "media_player.spotify", state: "playing", attributes: { friendly_name: "Spotify" } },
  { entity_id: "media_player.homepod", state: "idle", attributes: { friendly_name: "HomePod mini" } },
  { entity_id: "media_player.apple_tv", state: "standby", attributes: { friendly_name: "Apple TV 4K" } },
];

// Get icon for entity
const getEntityIcon = (domain: string, deviceClass?: string): LucideIcon => {
  if (domain === "light") {
    if (deviceClass === "monitor") return SunMedium;
    return Lamp;
  }
  if (domain === "sensor") {
    if (deviceClass === "temperature") return Thermometer;
    if (deviceClass === "humidity") return Droplets;
    if (deviceClass === "pm25" || deviceClass === "aqi") return Wind;
    if (deviceClass === "battery") return Battery;
    return Thermometer;
  }
  if (domain === "media_player") return Speaker;
  if (domain === "device_tracker") return Smartphone;
  return Lightbulb;
};

// Device Card Component
const DeviceCard = ({ 
  device, 
  categoryColor,
  categoryBgColor,
  categoryBorderColor,
  index 
}: { 
  device: Device; 
  categoryColor: string;
  categoryBgColor: string;
  categoryBorderColor: string;
  index: number;
}) => {
  const Icon = getEntityIcon(device.domain, device.deviceClass);
  const isOn = device.state === "on" || device.state === "playing" || device.state === "home";
  const isLight = device.domain === "light";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ 
        duration: 0.25, 
        delay: index * 0.02,
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
        ${categoryBgColor} ${categoryBorderColor} border
      `}>
        <Icon className={`w-4 h-4 ${categoryColor}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/90 font-light truncate">
          {device.name}
        </div>
        <div className="text-xs text-white/40 font-light truncate">
          {device.entityId}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isLight && (
          <div className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${isOn ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-white/20"}
          `} />
        )}
        <span className={`
          text-xs font-light
          ${isOn ? "text-white/80" : "text-white/40"}
        `}>
          {device.state}
        </span>
      </div>
    </motion.div>
  );
};

// Collapsible Category Section
const CategorySection = ({ 
  category,
  index,
  defaultOpen = false
}: { 
  category: CategoryData;
  index: number;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (category.devices.length === 0) return null;
  
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
            ${category.bgColor}
          `}>
            <category.icon className={`w-4 h-4 ${category.color}`} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-light text-white/90">
              {category.title}
            </h3>
            <span className="text-xs text-white/40 font-light">
              {category.devices.length} {category.devices.length === 1 ? "device" : "devices"}
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
              {category.devices.map((device, i) => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  categoryColor={category.color}
                  categoryBgColor={category.bgColor}
                  categoryBorderColor={category.borderColor}
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
const ScanningPhase = ({ 
  onComplete,
  onError,
  config 
}: { 
  onComplete: (entities: HAEntity[]) => void;
  onError: (error: string) => void;
  config: { baseUrl: string; accessToken: string } | null;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState("");
  
  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 400);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch entities
  useEffect(() => {
    const fetchEntities = async () => {
      // Step 1: Connecting
      setCurrentStep(0);
      await new Promise(r => setTimeout(r, 600));
      
      // Step 2: Fetching
      setCurrentStep(1);
      
      try {
        // Try real connection first if config exists
        if (config) {
          const { data, error } = await haProxyClient.get<HAEntity[]>("/api/states");
          
          if (!error && data && data.length > 0) {
            // Step 3: Organizing
            setCurrentStep(2);
            await new Promise(r => setTimeout(r, 400));
            onComplete(data);
            return;
          }
        }
        
        // Fallback to mock data for demo
        console.log("[Demo Discovery] Using mock data for demo experience");
        await new Promise(r => setTimeout(r, 800));
        
        // Step 3: Organizing
        setCurrentStep(2);
        await new Promise(r => setTimeout(r, 400));
        
        onComplete(MOCK_ENTITIES);
      } catch (err) {
        // Still fallback to mock on error
        console.log("[Demo Discovery] Connection failed, using mock data");
        setCurrentStep(2);
        await new Promise(r => setTimeout(r, 400));
        onComplete(MOCK_ENTITIES);
      }
    };
    
    fetchEntities();
  }, [config, onComplete, onError]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE.apple }}
      className="flex flex-col items-center text-center py-16"
    >
      {/* Subtle pulsing ring */}
      <div className="relative w-16 h-16 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-white/20"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.1, 0.5],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
        <div className="absolute inset-0 rounded-full bg-white/5 flex items-center justify-center">
          <HomeAssistantIcon className="w-7 h-7 text-[#18BCF2]/80" />
        </div>
      </div>
      
      {/* Status Text */}
      <motion.p
        key={currentStep}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-sm text-white/60 font-light"
      >
        {SCAN_STEPS[currentStep]}{dots}
      </motion.p>
      
      {/* Step indicators */}
      <div className="flex items-center gap-2 mt-6">
        {SCAN_STEPS.map((_, i) => (
          <motion.div
            key={i}
            className={`
              w-1.5 h-1.5 rounded-full transition-all duration-300
              ${i <= currentStep ? "bg-white/50" : "bg-white/15"}
            `}
            animate={i === currentStep ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Error State Component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center text-center py-12"
  >
    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
      <AlertCircle className="w-7 h-7 text-red-400" />
    </div>
    <p className="text-sm text-white/70 font-light mb-2">Connection Failed</p>
    <p className="text-xs text-white/40 font-light mb-6 max-w-xs">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-sm font-light transition-colors"
    >
      Try Again
    </button>
  </motion.div>
);

export default function DemoDiscovery() {
  const navigate = useNavigate();
  const { config } = useHAConnection();
  const [phase, setPhase] = useState<"scanning" | "results" | "error">("scanning");
  const [error, setError] = useState<string>("");
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);
  
  // Process entities into categories
  const processEntities = useCallback((entities: HAEntity[]) => {
    const lights: Device[] = [];
    const climate: Device[] = [];
    const media: Device[] = [];
    const devices: Device[] = [];
    
    entities.forEach(entity => {
      const [domain] = entity.entity_id.split(".");
      const deviceClass = entity.attributes.device_class;
      
      const device: Device = {
        id: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        state: entity.state,
        entityId: entity.entity_id,
        domain,
        deviceClass,
      };
      
      // Categorize
      if (domain === "light") {
        lights.push(device);
      } else if (domain === "sensor") {
        if (deviceClass === "temperature" || deviceClass === "humidity" || 
            deviceClass === "pm25" || deviceClass === "aqi" || deviceClass === "carbon_dioxide") {
          climate.push(device);
        } else if (deviceClass === "battery") {
          devices.push(device);
        }
      } else if (domain === "media_player") {
        media.push(device);
      } else if (domain === "device_tracker") {
        devices.push(device);
      }
    });
    
    const categoriesData: CategoryData[] = [
      {
        title: "Lighting",
        icon: Lightbulb,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        borderColor: "border-amber-400/20",
        devices: lights.slice(0, 20), // Limit for performance
      },
      {
        title: "Climate",
        icon: Thermometer,
        color: "text-cyan-400",
        bgColor: "bg-cyan-400/10",
        borderColor: "border-cyan-400/20",
        devices: climate.slice(0, 15),
      },
      {
        title: "Devices",
        icon: Battery,
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400/20",
        devices: devices.slice(0, 15),
      },
      {
        title: "Media",
        icon: Speaker,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/20",
        devices: media.slice(0, 10),
      },
    ].filter(c => c.devices.length > 0);
    
    setCategories(categoriesData);
    setTotalDevices(categoriesData.reduce((sum, c) => sum + c.devices.length, 0));
    setPhase("results");
  }, []);
  
  const handleError = useCallback((err: string) => {
    setError(err);
    setPhase("error");
  }, []);
  
  const handleRetry = useCallback(() => {
    setPhase("scanning");
    setError("");
  }, []);

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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE.apple }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE.apple }}
          className="flex flex-col items-center text-center mb-4"
        >
          {phase === "results" && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: EASE.apple }}
                className="
                  w-12 h-12 rounded-xl mb-4
                  bg-green-500/15 border border-green-500/25
                  flex items-center justify-center
                "
              >
                <Check className="w-6 h-6 text-green-400" />
              </motion.div>
              
              <h1 className="text-xl font-light text-white/90 tracking-wide mb-1">
                Discovery Complete
              </h1>
              <p className="text-sm text-white/50 font-light">
                Found {totalDevices} devices
              </p>
            </>
          )}
          
          {phase === "scanning" && (
            <h1 className="text-xl font-light text-white/90 tracking-wide">
              Discovering Devices
            </h1>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "scanning" && (
            <ScanningPhase 
              key="scanning"
              config={config}
              onComplete={processEntities}
              onError={handleError}
            />
          )}
          
          {phase === "error" && (
            <ErrorState 
              key="error"
              error={error}
              onRetry={handleRetry}
            />
          )}
          
          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE.apple }}
            >
              {/* Divider */}
              <div className="h-px bg-white/5 my-4" />

              {/* Categories */}
              <div className="space-y-3">
                {categories.map((category, i) => (
                  <CategorySection
                    key={category.title}
                    category={category}
                    index={i}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>

              {/* Footer Action */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3, ease: EASE.apple }}
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
          transition={{ duration: 0.4, delay: 0.4, ease: EASE.apple }}
          className="
            mt-6 flex items-center gap-6
            text-white/40 text-xs font-light
          "
        >
          {categories.map((category) => (
            <div key={category.title} className="flex items-center gap-1.5">
              <category.icon className={`w-3.5 h-3.5 ${category.color}`} />
              <span>{category.devices.length}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}