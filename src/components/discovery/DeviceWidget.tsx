import { DisplayableValue } from '@/config/deviceDisplayTemplates';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Battery, 
  Lightbulb, 
  Sun, 
  Zap, 
  Music,
  Volume2,
  Activity
} from 'lucide-react';

interface DeviceWidgetProps {
  widget: DisplayableValue;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'Thermometer': Thermometer,
    'Droplets': Droplets,
    'Wind': Wind,
    'Battery': Battery,
    'Lightbulb': Lightbulb,
    'Sun': Sun,
    'Zap': Zap,
    'Music': Music,
    'Volume2': Volume2,
    'Activity': Activity
  };
  
  return icons[iconName] || Activity;
};

const DeviceWidget = ({ widget }: DeviceWidgetProps) => {
  const Icon = getIcon(widget.icon);
  const isActive = widget.isActive !== false;
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={`w-3 h-3 flex-shrink-0 transition-colors ${
        isActive ? 'text-[hsl(43_88%_60%)]' : 'text-white/40'
      }`} />
      <span className="text-white/50 truncate flex-1 min-w-0 font-light">
        {widget.label}
      </span>
      <span className={`font-light flex-shrink-0 transition-colors ${
        isActive ? 'text-[hsl(43_88%_60%)]' : 'text-white/70'
      }`}>
        {widget.value}{widget.unit || ''}
      </span>
    </div>
  );
};

export default DeviceWidget;
