import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { 
  Power, 
  Loader2, 
  Fan,
  Lock,
  LockOpen,
  ChevronUp,
  ChevronDown,
  Square,
  Flame,
  Snowflake,
  Wind
} from 'lucide-react';
import { DiscoveredEntity } from '@/types/discovery';
import { homeAssistant } from '@/services/homeAssistant';
import { getIconForLight } from '@/components/icons/LightIcons';

interface EntityControlProps {
  entity: DiscoveredEntity;
  onStateChange: (entityId: string, newState: any) => void;
  isConnected: boolean;
}

const CONTROLLABLE_DOMAINS = ['light', 'switch', 'fan', 'cover', 'lock', 'climate'];

export function isControllable(domain: string): boolean {
  return CONTROLLABLE_DOMAINS.includes(domain);
}

export const EntityControl = ({ entity, onStateChange, isConnected }: EntityControlProps) => {
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [localState, setLocalState] = useState(entity.state);
  const [localAttributes, setLocalAttributes] = useState(entity.attributes);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with entity updates
  useEffect(() => {
    if (!isPending) {
      setLocalState(entity.state);
      setLocalAttributes(entity.attributes);
    }
  }, [entity.state, entity.attributes, isPending]);

  const handleAction = async (action: () => Promise<boolean>, optimisticState?: any) => {
    if (!isConnected || isPending) return;

    setIsPending(true);
    setHasError(false);

    // Optimistic update
    if (optimisticState) {
      setLocalState(optimisticState.state || localState);
      setLocalAttributes({ ...localAttributes, ...optimisticState.attributes });
      onStateChange(entity.entity_id, optimisticState);
    }

    try {
      const success = await action();
      if (!success) {
        throw new Error('Action failed');
      }
    } catch (error) {
      console.error('Entity control error:', error);
      setHasError(true);
      // Rollback
      setLocalState(entity.state);
      setLocalAttributes(entity.attributes);
    } finally {
      setIsPending(false);
    }
  };

  const handleDebouncedAction = (action: () => Promise<boolean>, optimisticState?: any, delay = 300) => {
    // Immediate optimistic update
    if (optimisticState) {
      setLocalState(optimisticState.state || localState);
      setLocalAttributes({ ...localAttributes, ...optimisticState.attributes });
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleAction(action, optimisticState);
    }, delay);
  };

  // Light Control
  if (entity.domain === 'light') {
    const isOn = localState === 'on';
    const brightness = Math.round((localAttributes.brightness || 0) / 255 * 100);
    const IconComponent = getIconForLight(entity.entity_id);

    const handleToggle = () => {
      const newState = isOn ? 'off' : 'on';
      const newBrightness = isOn ? 0 : 100;
      handleAction(
        () => homeAssistant.setLightBrightness(entity.entity_id, newBrightness),
        { state: newState, attributes: { brightness: isOn ? 0 : 255 } }
      );
    };

    const handleBrightnessChange = (values: number[]) => {
      const newBrightness = values[0];
      const newState = newBrightness === 0 ? 'off' : 'on';
      handleDebouncedAction(
        () => homeAssistant.setLightBrightness(entity.entity_id, newBrightness),
        { state: newState, attributes: { brightness: Math.round(newBrightness / 100 * 255) } }
      );
    };

    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <button
          onClick={handleToggle}
          disabled={!isConnected || isPending}
          className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <IconComponent 
            className="w-5 h-5 transition-colors" 
            style={{ color: isOn ? 'hsl(44 85% 58%)' : 'rgba(255, 255, 255, 0.3)' }}
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-light text-white/90">{entity.friendly_name}</div>
          <div className="text-xs text-white/50">{isOn ? `${brightness}%` : 'Off'}</div>
        </div>

        {isOn && (
          <div className="flex-shrink-0 w-32">
            <Slider
              value={[brightness]}
              onValueChange={handleBrightnessChange}
              max={100}
              step={1}
              disabled={!isConnected || isPending}
            />
          </div>
        )}

        {isPending && (
          <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
        )}
      </div>
    );
  }

  // Switch Control
  if (entity.domain === 'switch') {
    const isOn = localState === 'on';

    const handleToggle = () => {
      handleAction(
        () => homeAssistant.toggleSwitch(entity.entity_id, !isOn),
        { state: isOn ? 'off' : 'on', attributes: {} }
      );
    };

    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <button
          onClick={handleToggle}
          disabled={!isConnected || isPending}
          className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <Power 
            className="w-5 h-5 transition-colors" 
            style={{ color: isOn ? 'hsl(44 85% 58%)' : 'rgba(255, 255, 255, 0.3)' }}
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-light text-white/90">{entity.friendly_name}</div>
          <div className="text-xs text-white/50">{isOn ? 'On' : 'Off'}</div>
        </div>

        {isPending && (
          <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
        )}
      </div>
    );
  }

  // Fan Control
  if (entity.domain === 'fan') {
    const isOn = localState === 'on';
    const percentage = localAttributes.percentage || 0;

    const handleToggle = () => {
      handleAction(
        () => homeAssistant.toggleFan(entity.entity_id, !isOn),
        { state: isOn ? 'off' : 'on', attributes: { percentage: isOn ? 0 : 100 } }
      );
    };

    const handleSpeedChange = (values: number[]) => {
      const newSpeed = values[0];
      handleDebouncedAction(
        () => homeAssistant.setFanSpeed(entity.entity_id, newSpeed),
        { state: newSpeed === 0 ? 'off' : 'on', attributes: { percentage: newSpeed } }
      );
    };

    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <button
          onClick={handleToggle}
          disabled={!isConnected || isPending}
          className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <Fan 
            className="w-5 h-5 transition-colors" 
            style={{ color: isOn ? 'hsl(44 85% 58%)' : 'rgba(255, 255, 255, 0.3)' }}
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-light text-white/90">{entity.friendly_name}</div>
          <div className="text-xs text-white/50">{isOn ? `${percentage}%` : 'Off'}</div>
        </div>

        {isOn && (
          <div className="flex-shrink-0 w-32">
            <Slider
              value={[percentage]}
              onValueChange={handleSpeedChange}
              max={100}
              step={1}
              disabled={!isConnected || isPending}
            />
          </div>
        )}

        {isPending && (
          <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
        )}
      </div>
    );
  }

  // Cover Control
  if (entity.domain === 'cover') {
    const position = localAttributes.current_position || 0;
    const isOpen = localState === 'open';
    const isClosed = localState === 'closed';

    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex gap-1">
          <button
            onClick={() => handleAction(() => homeAssistant.openCover(entity.entity_id))}
            disabled={!isConnected || isPending}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronUp className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={() => handleAction(() => homeAssistant.stopCover(entity.entity_id))}
            disabled={!isConnected || isPending}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <Square className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={() => handleAction(() => homeAssistant.closeCover(entity.entity_id))}
            disabled={!isConnected || isPending}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-light text-white/90">{entity.friendly_name}</div>
          <div className="text-xs text-white/50">{position}%</div>
        </div>

        <div className="flex-shrink-0 w-32">
          <Slider
            value={[position]}
            onValueChange={(values) => handleDebouncedAction(
              () => homeAssistant.setCoverPosition(entity.entity_id, values[0]),
              { attributes: { current_position: values[0] } }
            )}
            max={100}
            step={1}
            disabled={!isConnected || isPending}
          />
        </div>

        {isPending && (
          <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
        )}
      </div>
    );
  }

  // Lock Control
  if (entity.domain === 'lock') {
    const isLocked = localState === 'locked';

    const handleToggle = () => {
      handleAction(
        () => isLocked ? homeAssistant.unlockDoor(entity.entity_id) : homeAssistant.lockDoor(entity.entity_id),
        { state: isLocked ? 'unlocked' : 'locked', attributes: {} }
      );
    };

    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <button
          onClick={handleToggle}
          disabled={!isConnected || isPending}
          className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {isLocked ? (
            <Lock className="w-5 h-5 text-[hsl(44_85%_58%)]" />
          ) : (
            <LockOpen className="w-5 h-5 text-white/30" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-light text-white/90">{entity.friendly_name}</div>
          <div className="text-xs text-white/50">{isLocked ? 'Locked' : 'Unlocked'}</div>
        </div>

        {isPending && (
          <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
        )}
      </div>
    );
  }

  // Climate Control
  if (entity.domain === 'climate') {
    const currentTemp = localAttributes.current_temperature || 0;
    const targetTemp = localAttributes.temperature || 0;
    const mode = localAttributes.hvac_mode || 'off';
    const modes = ['off', 'heat', 'cool', 'auto'];

    const handleTempChange = (delta: number) => {
      const newTemp = targetTemp + delta;
      handleAction(
        () => homeAssistant.setClimateTemperature(entity.entity_id, newTemp),
        { attributes: { temperature: newTemp } }
      );
    };

    const getModeIcon = (mode: string) => {
      switch (mode) {
        case 'heat': return <Flame className="w-4 h-4" />;
        case 'cool': return <Snowflake className="w-4 h-4" />;
        case 'auto': return <Wind className="w-4 h-4" />;
        default: return <Power className="w-4 h-4" />;
      }
    };

    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex gap-2">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => handleAction(
                () => homeAssistant.setClimateMode(entity.entity_id, m),
                { attributes: { hvac_mode: m } }
              )}
              disabled={!isConnected || isPending}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                mode === m ? 'bg-[hsl(44_85%_58%)]/20 text-[hsl(44_85%_58%)]' : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {getModeIcon(m)}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-light text-white/90">{entity.friendly_name}</div>
          <div className="text-xs text-white/50">{currentTemp}°C → {targetTemp}°C</div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => handleTempChange(-0.5)}
            disabled={!isConnected || isPending}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={() => handleTempChange(0.5)}
            disabled={!isConnected || isPending}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <ChevronUp className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {isPending && (
          <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
        )}
      </div>
    );
  }

  return null;
};
