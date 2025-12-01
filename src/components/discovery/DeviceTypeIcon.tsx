import { 
  Lightbulb, 
  Thermometer, 
  Music, 
  ToggleLeft, 
  Blinds, 
  Camera, 
  Wind,
  Lock,
  LockOpen,
  Fan,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  MapPin,
  HelpCircle,
  Activity,
  UserCheck,
  UserX,
  Sun,
  Droplets,
  DoorOpen,
  DoorClosed,
  Zap,
  Gauge,
  CloudOff,
  Flame,
  AlertTriangle,
  Droplet,
  SquareStack
} from 'lucide-react';
import { DeviceType } from '@/types/discovery';

interface DeviceTypeIconProps {
  type: DeviceType;
  deviceClass?: string;
  state?: string;
  className?: string;
}

const DeviceTypeIcon = ({ type, deviceClass, state, className = "w-5 h-5" }: DeviceTypeIconProps) => {
  const isActive = state === 'on' || state === 'playing' || state === 'home';
  const colorClass = isActive ? 'text-[hsl(43_88%_60%)]' : 'text-white/40';

  const iconProps = {
    className: `${className} ${colorClass}`,
    strokeWidth: 1.5
  };

  // Priority 1: Device class specific icons
  if (deviceClass) {
    switch (deviceClass) {
      case 'motion':
        return <Activity {...iconProps} />;
      case 'occupancy':
        return isActive ? <UserCheck {...iconProps} /> : <UserX {...iconProps} />;
      case 'illuminance':
        return <Sun {...iconProps} />;
      case 'temperature':
        return <Thermometer {...iconProps} />;
      case 'humidity':
        return <Droplets {...iconProps} />;
      case 'battery':
        const batteryLevel = parseFloat(state || '0');
        if (batteryLevel < 20) return <BatteryLow {...iconProps} />;
        if (batteryLevel < 50) return <BatteryMedium {...iconProps} />;
        return <BatteryFull {...iconProps} />;
      case 'door':
        return isActive ? <DoorOpen {...iconProps} /> : <DoorClosed {...iconProps} />;
      case 'window':
        return <SquareStack {...iconProps} />;
      case 'power':
      case 'energy':
        return <Zap {...iconProps} />;
      case 'pressure':
        return <Gauge {...iconProps} />;
      case 'pm25':
      case 'pm10':
      case 'aqi':
        return <Wind {...iconProps} />;
      case 'carbon_dioxide':
      case 'co2':
        return <CloudOff {...iconProps} />;
      case 'smoke':
        return <Flame {...iconProps} />;
      case 'gas':
        return <AlertTriangle {...iconProps} />;
      case 'moisture':
        return <Droplet {...iconProps} />;
    }
  }

  // Priority 2: Device type icons
  switch (type) {
    case 'light':
      return <Lightbulb {...iconProps} />;
    case 'climate':
      return <Thermometer {...iconProps} />;
    case 'media_player':
      return <Music {...iconProps} />;
    case 'switch':
      return <ToggleLeft {...iconProps} />;
    case 'cover':
      return <Blinds {...iconProps} />;
    case 'camera':
      return <Camera {...iconProps} />;
    case 'vacuum':
      return <Wind {...iconProps} />;
    case 'lock':
      return isActive ? <Lock {...iconProps} /> : <LockOpen {...iconProps} />;
    case 'fan':
      return <Fan {...iconProps} />;
    case 'battery':
      return <Battery {...iconProps} />;
    case 'tracker':
      return <MapPin {...iconProps} />;
    case 'sensor':
      return <Thermometer {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};

export default DeviceTypeIcon;
