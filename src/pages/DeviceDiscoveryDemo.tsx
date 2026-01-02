import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Radar, Search, Lightbulb, Thermometer, Droplets, 
  Music2, Wind, Check, Plus, Loader2, Home,
  ChevronDown, ChevronRight, Tv, Plug
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Types
type DeviceType = "light" | "sensor" | "media" | "climate" | "switch";
type DeviceState = "on" | "off" | "playing" | "idle" | "cooling" | "heating";

interface Device {
  id: string;
  name: string;
  entityId: string;
  type: DeviceType;
  state: DeviceState;
  value?: string;
  room: string;
}

type ScanState = "idle" | "scanning" | "results";

// Demo data
const DEMO_DEVICES: Device[] = [
  { id: "1", name: "Main Light", entityId: "light.living_room_main", type: "light", state: "on", value: "80%", room: "Living Room" },
  { id: "2", name: "TV Speaker", entityId: "media_player.living_room_tv", type: "media", state: "playing", value: "Jazz FM", room: "Living Room" },
  { id: "3", name: "Temperature", entityId: "sensor.living_room_temp", type: "sensor", state: "idle", value: "22.5°C", room: "Living Room" },
  { id: "4", name: "Smart Plug", entityId: "switch.living_room_plug", type: "switch", state: "on", room: "Living Room" },
  { id: "5", name: "Bedside Lamp", entityId: "light.bedroom_bedside", type: "light", state: "off", room: "Bedroom" },
  { id: "6", name: "AC Unit", entityId: "climate.bedroom_ac", type: "climate", state: "cooling", value: "24°C", room: "Bedroom" },
  { id: "7", name: "Ceiling Light", entityId: "light.kitchen_ceiling", type: "light", state: "on", value: "100%", room: "Kitchen" },
  { id: "8", name: "Humidity", entityId: "sensor.kitchen_humidity", type: "sensor", state: "idle", value: "45%", room: "Kitchen" },
  { id: "9", name: "Coffee Maker", entityId: "switch.kitchen_coffee", type: "switch", state: "off", room: "Kitchen" },
  { id: "10", name: "Motion Sensor", entityId: "sensor.hallway_motion", type: "sensor", state: "idle", value: "Clear", room: "Hallway" },
  { id: "11", name: "Entry Light", entityId: "light.hallway_entry", type: "light", state: "off", room: "Hallway" },
  { id: "12", name: "Desk Lamp", entityId: "light.office_desk", type: "light", state: "on", value: "60%", room: "Office" },
  { id: "13", name: "Air Purifier", entityId: "fan.office_purifier", type: "climate", state: "on", value: "Auto", room: "Office" },
];

// Animation configs
const EASE = {
  smooth: [0.4, 0, 0.2, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  entrance: [0.16, 1, 0.3, 1] as const,
};

const SPRING = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15 },
  snappy: { type: "spring" as const, stiffness: 400, damping: 25 },
};

// Get icon for device type
const getDeviceIcon = (type: DeviceType) => {
  switch (type) {
    case "light": return Lightbulb;
    case "sensor": return Thermometer;
    case "media": return Music2;
    case "climate": return Wind;
    case "switch": return Plug;
    default: return Lightbulb;
  }
};

// Get state color
const getStateColor = (state: DeviceState, type: DeviceType) => {
  if (state === "off" || state === "idle") return "text-muted-foreground/50";
  if (type === "light") return "text-amber-400";
  if (type === "media") return "text-green-400";
  if (type === "climate") return "text-cyan-400";
  if (type === "switch") return "text-purple-400";
  return "text-primary";
};

// Device Item Component
const DeviceItem = memo(({ 
  device, 
  isAdded, 
  onToggle,
  index,
  isVisible 
}: { 
  device: Device; 
  isAdded: boolean; 
  onToggle: () => void;
  index: number;
  isVisible: boolean;
}) => {
  const Icon = getDeviceIcon(device.type);
  const stateColor = getStateColor(device.state, device.type);
  const isActive = device.state !== "off" && device.state !== "idle";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : -20,
        filter: isVisible ? "blur(0px)" : "blur(10px)",
        height: isVisible ? "auto" : 0,
        marginBottom: isVisible ? 8 : 0,
      }}
      exit={{ opacity: 0, x: 20, filter: "blur(10px)", height: 0, marginBottom: 0 }}
      transition={{ 
        ...SPRING.gentle, 
        delay: index * 0.05,
        height: { duration: 0.2 },
      }}
      className="group relative overflow-hidden"
    >
      <motion.div
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
        whileTap={{ scale: 0.98 }}
        transition={SPRING.snappy}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
          border transition-colors duration-200
          ${isAdded 
            ? "border-primary/30 bg-primary/5" 
            : "border-white/5 bg-white/[0.02] hover:border-white/10"
          }
        `}
        onClick={onToggle}
      >
        {/* Icon */}
        <motion.div 
          className={`
            relative w-10 h-10 rounded-xl flex items-center justify-center
            ${isActive ? "bg-white/10" : "bg-white/5"}
          `}
          animate={isActive ? { 
            boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.1)", "0 0 0px rgba(255,255,255,0)"]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className={`w-5 h-5 ${stateColor}`} strokeWidth={1.5} />
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ 
                background: `radial-gradient(circle, ${device.type === "light" ? "rgba(251,191,36,0.2)" : "rgba(34,211,238,0.2)"}, transparent 70%)` 
              }}
            />
          )}
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {device.name}
            </span>
            {device.value && (
              <span className={`text-xs font-medium ${stateColor}`}>
                {device.value}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-[10px] text-muted-foreground/50 font-mono truncate">
              {device.entityId}
            </code>
          </div>
        </div>

        {/* State indicator */}
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400" : "bg-muted-foreground/30"}`}
            animate={isActive ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={SPRING.bouncy}
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            transition-colors duration-200
            ${isAdded 
              ? "bg-primary text-primary-foreground" 
              : "bg-white/10 text-foreground hover:bg-white/20"
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={SPRING.bouncy}
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={SPRING.bouncy}
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.div>
  );
});

DeviceItem.displayName = "DeviceItem";

// Room Section Component
const RoomSection = memo(({ 
  room, 
  devices, 
  addedDevices, 
  onToggleDevice,
  isExpanded,
  onToggleExpand,
  searchQuery,
  startIndex
}: { 
  room: string; 
  devices: Device[]; 
  addedDevices: Set<string>;
  onToggleDevice: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  searchQuery: string;
  startIndex: number;
}) => {
  const addedCount = devices.filter(d => addedDevices.has(d.id)).length;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING.gentle}
      className="mb-4"
    >
      {/* Room header */}
      <motion.button
        whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        whileTap={{ scale: 0.99 }}
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg mb-2"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={SPRING.snappy}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
        <Home className="w-4 h-4 text-muted-foreground/70" strokeWidth={1.5} />
        <span className="text-sm font-medium text-foreground/80">{room}</span>
        <span className="text-xs text-muted-foreground/50 ml-auto">
          {addedCount}/{devices.length}
        </span>
        <motion.div
          className="w-2 h-2 rounded-full"
          animate={{ 
            backgroundColor: addedCount === devices.length ? "#4ade80" : 
                           addedCount > 0 ? "#fbbf24" : "rgba(255,255,255,0.2)"
          }}
        />
      </motion.button>

      {/* Devices */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE.smooth }}
            className="pl-4 overflow-hidden"
          >
            {devices.map((device, i) => (
              <DeviceItem
                key={device.id}
                device={device}
                isAdded={addedDevices.has(device.id)}
                onToggle={() => onToggleDevice(device.id)}
                index={startIndex + i}
                isVisible={!searchQuery || 
                  device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  device.entityId.toLowerCase().includes(searchQuery.toLowerCase())
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

RoomSection.displayName = "RoomSection";

// Radar Animation Component - Apple-inspired elegant design
const RadarAnimation = memo(() => (
  <div className="relative w-28 h-28 mx-auto mb-8">
    {/* Static concentric circles */}
    {[0.35, 0.6, 0.85, 1].map((scale, i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full border border-white/[0.08]"
        style={{ transform: `scale(${scale})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1, duration: 0.5 }}
      />
    ))}
    
    {/* Elegant sweep gradient */}
    <motion.div
      className="absolute inset-0 rounded-full overflow-hidden"
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(251, 191, 36, 0.15) 30deg,
            rgba(251, 191, 36, 0.4) 60deg,
            rgba(251, 191, 36, 0.15) 90deg,
            transparent 120deg,
            transparent 360deg
          )`,
        }}
      />
    </motion.div>
    
    {/* Center icon container */}
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, ...SPRING.gentle }}
    >
      <motion.div 
        className="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-black/20 flex items-center justify-center"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      >
        <Radar className="w-7 h-7 text-[#302A23]" strokeWidth={1.5} />
      </motion.div>
    </motion.div>
    
    {/* Soft pulse rings */}
    {[0, 1].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full border border-amber-400/30"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.1, opacity: [0.4, 0] }}
        transition={{ 
          duration: 2.5, 
          repeat: Infinity, 
          delay: i * 1.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
    ))}
  </div>
));

RadarAnimation.displayName = "RadarAnimation";

// Discovered count animation
const DiscoveredCounter = memo(({ count, total }: { count: number; total: number }) => (
  <motion.div 
    className="text-center mb-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={SPRING.gentle}
  >
    <motion.span 
      className="text-4xl font-light text-foreground"
      key={count}
      initial={{ scale: 1.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING.bouncy}
    >
      {count}
    </motion.span>
    <span className="text-lg text-muted-foreground/60 ml-1">/ {total}</span>
    <p className="text-sm text-muted-foreground/50 mt-1">devices discovered</p>
  </motion.div>
));

DiscoveredCounter.displayName = "DiscoveredCounter";

// Main Component
const DeviceDiscoveryDemo = () => {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [addedDevices, setAddedDevices] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  // Group devices by room
  const devicesByRoom = useMemo(() => {
    const grouped: Record<string, Device[]> = {};
    discoveredDevices.forEach(device => {
      if (!grouped[device.room]) grouped[device.room] = [];
      grouped[device.room].push(device);
    });
    return grouped;
  }, [discoveredDevices]);

  // Start scanning simulation
  const startScanning = useCallback(() => {
    setScanState("scanning");
    setDiscoveredDevices([]);
    setAddedDevices(new Set());
    setExpandedRooms(new Set());

    // Simulate discovering devices one by one
    DEMO_DEVICES.forEach((device, index) => {
      setTimeout(() => {
        setDiscoveredDevices(prev => [...prev, device]);
        // Auto-expand room when first device is discovered
        setExpandedRooms(prev => new Set([...prev, device.room]));
        
        // After last device, switch to results
        if (index === DEMO_DEVICES.length - 1) {
          setTimeout(() => setScanState("results"), 500);
        }
      }, 300 + index * 200);
    });
  }, []);

  // Toggle device
  const toggleDevice = useCallback((deviceId: string) => {
    setAddedDevices(prev => {
      const next = new Set(prev);
      if (next.has(deviceId)) {
        next.delete(deviceId);
      } else {
        next.add(deviceId);
      }
      return next;
    });
  }, []);

  // Toggle room expansion
  const toggleRoom = useCallback((room: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(room)) {
        next.delete(room);
      } else {
        next.add(room);
      }
      return next;
    });
  }, []);

  // Add all devices
  const addAll = useCallback(() => {
    setAddedDevices(new Set(discoveredDevices.map(d => d.id)));
  }, [discoveredDevices]);

  // Reset
  const reset = useCallback(() => {
    setScanState("idle");
    setDiscoveredDevices([]);
    setAddedDevices(new Set());
    setSearchQuery("");
    setExpandedRooms(new Set());
  }, []);

  // Calculate cumulative indices for stagger
  let deviceIndex = 0;

  return (
    <div className="min-h-screen bg-[#302A23] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background - matching main demo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Warm ambient glow - top left */}
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ 
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.06), transparent 70%)",
            filter: "blur(80px)"
          }}
          animate={{ 
            scale: [1, 1.08, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        />
        {/* Subtle cool accent - bottom right */}
        <motion.div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full"
          style={{ 
            background: "radial-gradient(circle, rgba(120, 100, 80, 0.05), transparent 70%)",
            filter: "blur(60px)"
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE.entrance }}
        className="relative w-full max-w-md"
      >
        <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={scanState === "scanning" ? { 
                  boxShadow: ["0 0 0px rgba(var(--primary-rgb), 0)", "0 0 30px rgba(var(--primary-rgb), 0.4)", "0 0 0px rgba(var(--primary-rgb), 0)"]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Radar className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Device Discovery
                </h1>
                <p className="text-sm text-muted-foreground/60">
                  {scanState === "idle" && "Scan your network for smart devices"}
                  {scanState === "scanning" && "Scanning your network..."}
                  {scanState === "results" && `${discoveredDevices.length} devices found`}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {/* Idle State */}
              {scanState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-center py-10"
                >
                  {/* Idle radar icon */}
                  <motion.div 
                    className="relative w-24 h-24 mx-auto mb-8"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Subtle rings */}
                    {[0.4, 0.7, 1].map((scale, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border border-white/[0.06]"
                        style={{ transform: `scale(${scale})` }}
                      />
                    ))}
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-black/20 flex items-center justify-center"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <Radar className="w-7 h-7 text-[#302A23]" strokeWidth={1.5} />
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-white/50 font-light mb-8 text-sm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    Ready to discover smart devices
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={startScanning}
                      className="px-8 py-5 text-sm font-medium rounded-2xl bg-white text-[#302A23] hover:bg-white/90 shadow-lg shadow-black/20"
                    >
                      <Radar className="w-4 h-4 mr-2" />
                      Start Scanning
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Scanning State */}
              {scanState === "scanning" && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="py-4"
                >
                  <RadarAnimation />
                  <DiscoveredCounter count={discoveredDevices.length} total={DEMO_DEVICES.length} />
                  
                  {/* Discovered devices preview */}
                  <motion.div 
                    className="space-y-2 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <AnimatePresence mode="popLayout">
                      {discoveredDevices.slice(-4).map((device, i) => {
                        const Icon = getDeviceIcon(device.type);
                        const fadeMultiplier = discoveredDevices.length > 3 ? 0.15 : 0;
                        return (
                          <motion.div
                            key={device.id}
                            layout
                            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                            animate={{ 
                              opacity: 1 - (i * fadeMultiplier), 
                              y: 0, 
                              filter: "blur(0px)",
                              scale: 1 - (i * 0.01)
                            }}
                            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                            transition={{ 
                              duration: 0.4, 
                              ease: [0.25, 0.46, 0.45, 0.94],
                              layout: { duration: 0.3 }
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                              <Icon className="w-4 h-4 text-amber-400/70" strokeWidth={1.5} />
                            </div>
                            <span className="text-sm text-white/70 font-light truncate flex-1">{device.name}</span>
                            <span className="text-xs text-white/30">{device.room}</span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}

              {/* Results State */}
              {scanState === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Search */}
                  <motion.div 
                    className="relative mb-5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search devices..."
                      className="pl-11 py-3 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:border-amber-400/30 focus:bg-white/[0.06] transition-all duration-300"
                    />
                  </motion.div>

                  {/* Device list by room */}
                  <LayoutGroup>
                    {Object.entries(devicesByRoom).map(([room, devices], roomIndex) => {
                      const startIdx = deviceIndex;
                      deviceIndex += devices.length;
                      return (
                        <motion.div
                          key={room}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + roomIndex * 0.08, duration: 0.4 }}
                        >
                          <RoomSection
                            room={room}
                            devices={devices}
                            addedDevices={addedDevices}
                            onToggleDevice={toggleDevice}
                            isExpanded={expandedRooms.has(room)}
                            onToggleExpand={() => toggleRoom(room)}
                            searchQuery={searchQuery}
                            startIndex={startIdx}
                          />
                        </motion.div>
                      );
                    })}
                  </LayoutGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {scanState === "results" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="p-5 border-t border-white/[0.06] bg-black/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/40 font-light">
                  <motion.span
                    key={addedDevices.size}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-white font-medium"
                  >
                    {addedDevices.size}
                  </motion.span>
                  {" "}of {discoveredDevices.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Reset
                </Button>
              </div>
              <div className="flex gap-3">
                <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={addAll}
                    variant="outline"
                    className="w-full py-5 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white transition-all duration-200"
                    disabled={addedDevices.size === discoveredDevices.length}
                  >
                    Select All
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full py-5 rounded-xl bg-white text-[#302A23] hover:bg-white/90 shadow-lg shadow-black/20 transition-all duration-200"
                    disabled={addedDevices.size === 0}
                  >
                    Add {addedDevices.size > 0 && `(${addedDevices.size})`}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default DeviceDiscoveryDemo;
