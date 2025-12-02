/**
 * Component Registry - Auto-discoverable component catalog
 * Maintains a complete list of all components in the design system
 */

export interface ComponentInfo {
  name: string;
  path: string;
  description: string;
  category: 'primitives' | 'features' | 'layout' | 'icons';
  variants?: string[];
  sizes?: string[];
  states?: string[];
  props?: Array<{
    name: string;
    type: string;
    required?: boolean;
    default?: string;
    description?: string;
  }>;
  usedIn: string[];
  hasStorybook: boolean;
  storybookPath?: string;
}

export const componentRegistry: ComponentInfo[] = [
  // ============= UI PRIMITIVES =============
  {
    name: 'Button',
    path: '@/components/ui/button',
    description: 'Interactive button component with multiple variants and sizes',
    category: 'primitives',
    variants: ['default', 'primary', 'ghost', 'outline'],
    sizes: ['default', 'sm', 'lg', 'icon'],
    props: [
      { name: 'variant', type: 'string', default: 'default', description: 'Visual style variant' },
      { name: 'size', type: 'string', default: 'default', description: 'Button size' },
      { name: 'asChild', type: 'boolean', description: 'Render as child component' },
    ],
    usedIn: ['Settings', 'ErrorBoundary', 'ConnectionTab'],
    hasStorybook: true,
    storybookPath: '/ui/button',
  },
  {
    name: 'Slider',
    path: '@/components/ui/slider',
    description: 'Range input slider with smooth animation and hover effects',
    category: 'primitives',
    props: [
      { name: 'value', type: 'number[]', required: true, description: 'Current value' },
      { name: 'onValueChange', type: 'function', description: 'Value change callback' },
      { name: 'min', type: 'number', default: '0' },
      { name: 'max', type: 'number', default: '100' },
      { name: 'step', type: 'number', default: '1' },
    ],
    usedIn: ['LightControlCard', 'VolumeControl'],
    hasStorybook: true,
    storybookPath: '/ui/slider',
  },
  {
    name: 'Input',
    path: '@/components/ui/input',
    description: 'Text input field with consistent styling',
    category: 'primitives',
    props: [
      { name: 'type', type: 'string', default: 'text' },
      { name: 'placeholder', type: 'string' },
      { name: 'value', type: 'string' },
      { name: 'onChange', type: 'function' },
    ],
    usedIn: ['ConnectionTab', 'SettingsField'],
    hasStorybook: false,
  },
  {
    name: 'Dialog',
    path: '@/components/ui/dialog',
    description: 'Modal dialog overlay with backdrop',
    category: 'primitives',
    props: [
      { name: 'open', type: 'boolean', description: 'Open state' },
      { name: 'onOpenChange', type: 'function', description: 'Open state change callback' },
    ],
    usedIn: ['Settings page'],
    hasStorybook: false,
  },
  {
    name: 'Popover',
    path: '@/components/ui/popover',
    description: 'Floating popover for contextual content',
    category: 'primitives',
    usedIn: ['SpeakerPopover', 'LightHotspot tooltips'],
    hasStorybook: false,
  },
  {
    name: 'Tabs',
    path: '@/components/ui/tabs',
    description: 'Tabbed navigation component',
    category: 'primitives',
    usedIn: ['Settings page (Connection/Devices tabs)'],
    hasStorybook: false,
  },
  {
    name: 'Tooltip',
    path: '@/components/ui/tooltip',
    description: 'Contextual tooltip on hover',
    category: 'primitives',
    usedIn: ['ConnectionStatusIndicator', 'LightHotspot'],
    hasStorybook: false,
  },

  // ============= FEATURE COMPONENTS =============
  {
    name: 'LightControlCard',
    path: '@/features/lighting/components/LightControlCard',
    description: 'Card for controlling individual light intensity with slider',
    category: 'features',
    states: ['off', 'on', 'pending', 'error', 'loading'],
    props: [
      { name: 'id', type: 'string', required: true, description: 'Unique light identifier' },
      { name: 'label', type: 'string', required: true, description: 'Display label' },
      { name: 'intensity', type: 'number', required: true, description: 'Light intensity 0-100' },
      { name: 'isPending', type: 'boolean', description: 'Pending sync state' },
      { name: 'hasError', type: 'boolean', description: 'Error state' },
      { name: 'isLoading', type: 'boolean', description: 'Loading state' },
      { name: 'onChange', type: 'function', required: true, description: 'Intensity change callback' },
      { name: 'onHover', type: 'function', description: 'Hover state callback' },
    ],
    usedIn: ['Index page → RoomInfoPanel'],
    hasStorybook: true,
    storybookPath: '/features/lighting/lightcontrolcard',
  },
  {
    name: 'ClimateIndicator',
    path: '@/features/climate/components/ClimateIndicator',
    description: 'Climate data display with circular progress ring and tooltip',
    category: 'features',
    props: [
      { name: 'icon', type: 'ReactNode', required: true, description: 'Icon element' },
      { name: 'label', type: 'string', required: true },
      { name: 'value', type: 'number', required: true },
      { name: 'unit', type: 'string', required: true },
      { name: 'min', type: 'number', required: true },
      { name: 'max', type: 'number', required: true },
      { name: 'colorType', type: 'string', required: true },
      { name: 'isLoaded', type: 'boolean', required: true },
      { name: 'formatValue', type: 'function', description: 'Custom value formatter' },
    ],
    usedIn: ['RoomInfoPanel → ClimateIndicators'],
    hasStorybook: true,
    storybookPath: '/features/climate/climateindicator',
  },
  {
    name: 'CircularProgress',
    path: '@/features/climate/components/CircularProgress',
    description: 'Animated circular progress ring with dynamic color coding',
    category: 'features',
    props: [
      { name: 'value', type: 'number', required: true },
      { name: 'max', type: 'number', required: true },
      { name: 'size', type: 'number', default: '80' },
      { name: 'strokeWidth', type: 'number', default: '8' },
      { name: 'colorType', type: 'string', required: true },
      { name: 'isLoaded', type: 'boolean', default: 'false' },
      { name: 'delay', type: 'number', default: '0' },
    ],
    usedIn: ['ClimateIndicator', 'Battery indicators'],
    hasStorybook: false,
  },
  {
    name: 'DeskDisplay',
    path: '@/features/lighting/components/DeskDisplay',
    description: '3D desk image with interactive light hotspots and parallax effect',
    category: 'features',
    states: ['000', '001', '010', '011', '100', '101', '110', '111'],
    props: [
      { name: 'spotlightIntensity', type: 'number', required: true },
      { name: 'deskLampIntensity', type: 'number', required: true },
      { name: 'monitorLightIntensity', type: 'number', required: true },
      { name: 'onIntensityChange', type: 'function', required: true },
      { name: 'onLightHover', type: 'function' },
    ],
    usedIn: ['Index page - central image display'],
    hasStorybook: false,
  },
  {
    name: 'MediaPlayer',
    path: '@/components/MediaPlayer/MediaPlayer',
    description: 'Sonos/Spotify media player with playback controls',
    category: 'features',
    states: ['mini', 'full', 'playing', 'paused', 'idle'],
    props: [
      { name: 'playerState', type: 'MediaPlayerState', required: true },
      { name: 'onPlayPause', type: 'function' },
      { name: 'onVolumeChange', type: 'function' },
      { name: 'onSeek', type: 'function' },
      { name: 'onSpeakerSelect', type: 'function' },
    ],
    usedIn: ['Index page - sticky bottom player'],
    hasStorybook: false,
  },
  {
    name: 'ConnectionStatusIndicator',
    path: '@/components/ConnectionStatusIndicator',
    description: 'Visual indicator for Home Assistant connection status',
    category: 'features',
    states: ['connected', 'disconnected', 'reconnecting'],
    props: [
      { name: 'isConnected', type: 'boolean', required: true },
      { name: 'onRetry', type: 'function' },
    ],
    usedIn: ['TopNavigationBar'],
    hasStorybook: true,
    storybookPath: '/connectionstatusindicator',
  },

  // ============= LAYOUT COMPONENTS =============
  {
    name: 'RootLayout',
    path: '@/layouts/RootLayout',
    description: 'Root layout wrapper with navigation',
    category: 'layout',
    usedIn: ['App.tsx - wraps all pages'],
    hasStorybook: false,
  },
  {
    name: 'RoomInfoPanel',
    path: '@/components/RoomInfoPanel',
    description: 'Right panel with room info, climate data, and light controls',
    category: 'layout',
    props: [
      { name: 'roomName', type: 'string', required: true },
      { name: 'temperature', type: 'number' },
      { name: 'humidity', type: 'number' },
      { name: 'airQuality', type: 'number' },
      { name: 'lights', type: 'LightConfig[]', required: true },
      { name: 'onMasterToggle', type: 'function' },
    ],
    usedIn: ['Index page - right side panel'],
    hasStorybook: false,
  },
  {
    name: 'TopNavigationBar',
    path: '@/components/navigation/TopNavigationBar',
    description: 'Top navigation with settings and connection status',
    category: 'layout',
    usedIn: ['RootLayout'],
    hasStorybook: false,
  },

  // ============= ICONS =============
  {
    name: 'LightIcons',
    path: '@/components/icons/LightIcons',
    description: 'Custom light control icons (Philips Hue style)',
    category: 'icons',
    variants: ['hue:go', 'hue:room-computer', 'hue:wall-spot'],
    usedIn: ['LightControlCard', 'LightHotspot'],
    hasStorybook: false,
  },
  {
    name: 'ServiceIcons',
    path: '@/components/icons/ServiceIcons',
    description: 'Service brand icons (Spotify, etc.)',
    category: 'icons',
    usedIn: ['MediaPlayer'],
    hasStorybook: false,
  },
  {
    name: 'AirPodsMaxIcon',
    path: '@/components/icons/AirPodsMaxIcon',
    description: 'Custom AirPods Max icon',
    category: 'icons',
    usedIn: ['RoomInfoPanel - device battery'],
    hasStorybook: false,
  },
  {
    name: 'IPhoneIcon',
    path: '@/components/icons/IPhoneIcon',
    description: 'Custom iPhone icon',
    category: 'icons',
    usedIn: ['RoomInfoPanel - device battery'],
    hasStorybook: false,
  },
];

// Helper functions for filtering
export const getComponentsByCategory = (category: ComponentInfo['category']) => 
  componentRegistry.filter(c => c.category === category);

export const getComponentByName = (name: string) =>
  componentRegistry.find(c => c.name === name);

export const searchComponents = (query: string) =>
  componentRegistry.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  );
