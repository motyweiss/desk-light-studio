import { 
  Lightbulb, 
  Thermometer, 
  Music, 
  ToggleLeft, 
  Blinds, 
  Camera, 
  Wind,
  Lock,
  Fan,
  Battery,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { DeviceType } from '@/types/discovery';

interface DeviceTypeIconProps {
  type: DeviceType;
  state?: string;
  className?: string;
}

const DeviceTypeIcon = ({ type, state, className = "w-5 h-5" }: DeviceTypeIconProps) => {
  const isActive = state === 'on' || state === 'playing' || state === 'home';
  const colorClass = isActive ? 'text-[hsl(43_88%_60%)]' : 'text-white/40';

  const iconProps = {
    className: `${className} ${colorClass}`,
    strokeWidth: 1.5
  };

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
      return <Lock {...iconProps} />;
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
