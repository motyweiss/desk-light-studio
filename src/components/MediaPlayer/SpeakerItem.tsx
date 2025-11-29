import { motion } from 'framer-motion';
import { Speaker, Smartphone, Monitor, Volume2 } from 'lucide-react';
import { Check } from 'lucide-react';

interface SpeakerItemProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  type?: 'sonos' | 'spotify' | 'phone' | 'mac' | 'other';
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'phone':
      return Smartphone;
    case 'mac':
      return Monitor;
    case 'sonos':
    case 'spotify':
      return Volume2;
    default:
      return Speaker;
  }
};

const detectSpeakerType = (name: string): SpeakerItemProps['type'] => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('iphone') || lowerName.includes('phone')) return 'phone';
  if (lowerName.includes('mac') || lowerName.includes('macbook')) return 'mac';
  if (lowerName.includes('sonos')) return 'sonos';
  if (lowerName.includes('spotify')) return 'spotify';
  return 'other';
};

export const SpeakerItem = ({ name, isActive, onClick, type }: SpeakerItemProps) => {
  const detectedType = type || detectSpeakerType(name);
  const Icon = getIconForType(detectedType);

  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl
        transition-all duration-300
        ${isActive 
          ? 'bg-[hsl(44_85%_58%)]/15 border-[hsl(44_85%_58%)]/30' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }
        border backdrop-blur-sm
      `}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${isActive ? 'bg-[hsl(44_85%_58%)]/20' : 'bg-white/5'}
      `}>
        <Icon className={`w-5 h-5 ${isActive ? 'text-[hsl(44_85%_58%)]' : 'text-white/50'}`} />
      </div>
      
      <span className={`
        flex-1 text-left text-sm font-light
        ${isActive ? 'text-white' : 'text-white/70'}
      `}>
        {name}
      </span>

      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Check className="w-5 h-5 text-[hsl(44_85%_58%)]" />
        </motion.div>
      )}
    </motion.button>
  );
};