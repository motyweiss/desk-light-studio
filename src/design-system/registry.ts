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
  {
    name: 'Toast',
    path: '@/components/ui/toast',
    description: 'Toast notification system for user feedback',
    category: 'primitives',
    props: [
      { name: 'title', type: 'string', description: 'Toast title' },
      { name: 'description', type: 'string', description: 'Toast description' },
      { name: 'variant', type: 'string', description: 'Visual style variant' },
    ],
    usedIn: ['Connection error handling', 'Success notifications'],
    hasStorybook: false,
  },
  {
    name: 'Select',
    path: '@/components/ui/select',
    description: 'Dropdown select input component',
    category: 'primitives',
    usedIn: ['EntitySearchSelect', 'Settings forms'],
    hasStorybook: false,
  },
  {
    name: 'Command',
    path: '@/components/ui/command',
    description: 'Command palette with search and keyboard navigation',
    category: 'primitives',
    props: [
      { name: 'value', type: 'string', description: 'Current value' },
      { name: 'onValueChange', type: 'function', description: 'Value change callback' },
    ],
    usedIn: ['EntitySearchSelect', 'SpeakerPopover'],
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
      { name: 'isReconnecting', type: 'boolean' },
      { name: 'onReconnectClick', type: 'function' },
      { name: 'inline', type: 'boolean' },
    ],
    usedIn: ['TopNavigationBar'],
    hasStorybook: true,
    storybookPath: '/connectionstatusindicator',
  },
  {
    name: 'AlbumArt',
    path: '@/components/MediaPlayer/AlbumArt',
    description: 'Album artwork display with loading states',
    category: 'features',
    props: [
      { name: 'imageUrl', type: 'string', description: 'Album cover URL' },
      { name: 'size', type: 'number', description: 'Image size in pixels' },
    ],
    usedIn: ['MediaPlayer'],
    hasStorybook: false,
  },
  {
    name: 'PlaybackControls',
    path: '@/components/MediaPlayer/PlaybackControls',
    description: 'Media playback control buttons (play/pause, skip, shuffle, repeat)',
    category: 'features',
    props: [
      { name: 'isPlaying', type: 'boolean', required: true },
      { name: 'shuffle', type: 'boolean', required: true },
      { name: 'repeat', type: 'string', required: true },
      { name: 'onPlayPause', type: 'function', required: true },
      { name: 'onNext', type: 'function', required: true },
      { name: 'onPrevious', type: 'function', required: true },
      { name: 'onShuffle', type: 'function', required: true },
      { name: 'onRepeat', type: 'function', required: true },
    ],
    usedIn: ['MediaPlayer'],
    hasStorybook: false,
  },
  {
    name: 'VolumeControl',
    path: '@/components/MediaPlayer/VolumeControl',
    description: 'Volume slider with mute toggle',
    category: 'features',
    props: [
      { name: 'volume', type: 'number', required: true },
      { name: 'isMuted', type: 'boolean', required: true },
      { name: 'onVolumeChange', type: 'function', required: true },
      { name: 'onMuteToggle', type: 'function', required: true },
    ],
    usedIn: ['MediaPlayer'],
    hasStorybook: false,
  },
  {
    name: 'ProgressBar',
    path: '@/components/MediaPlayer/ProgressBar',
    description: 'Playback progress bar with seek functionality',
    category: 'features',
    props: [
      { name: 'currentTime', type: 'number', required: true },
      { name: 'duration', type: 'number', required: true },
      { name: 'onSeek', type: 'function', required: true },
    ],
    usedIn: ['MediaPlayer'],
    hasStorybook: false,
  },
  {
    name: 'SpeakerPopover',
    path: '@/components/MediaPlayer/SpeakerPopover',
    description: 'Speaker selection dropdown with grouped sources',
    category: 'features',
    props: [
      { name: 'sources', type: 'string[]', required: true },
      { name: 'speakers', type: 'Speaker[]', required: true },
      { name: 'currentSource', type: 'string' },
      { name: 'onSelect', type: 'function', required: true },
    ],
    usedIn: ['MediaPlayer'],
    hasStorybook: false,
  },
  {
    name: 'SourceIndicator',
    path: '@/components/MediaPlayer/SourceIndicator',
    description: 'Streaming service logo indicator (Spotify, Apple Music, etc.)',
    category: 'features',
    props: [
      { name: 'appName', type: 'string', required: true },
    ],
    usedIn: ['MediaPlayer'],
    hasStorybook: false,
  },
  {
    name: 'EntitySearchSelect',
    path: '@/components/settings/EntitySearchSelect',
    description: 'Searchable entity selector for Home Assistant devices',
    category: 'features',
    props: [
      { name: 'entities', type: 'Entity[]', required: true },
      { name: 'value', type: 'string' },
      { name: 'onChange', type: 'function', required: true },
      { name: 'placeholder', type: 'string' },
    ],
    usedIn: ['DevicesTab', 'Settings forms'],
    hasStorybook: false,
  },
  {
    name: 'AudioVisualizer',
    path: '@/components/MediaPlayer/AudioVisualizer',
    description: 'Audio waveform visualizer animation',
    category: 'features',
    usedIn: ['MediaPlayer - visual effects'],
    hasStorybook: false,
  },
  {
    name: 'MusicParticles',
    path: '@/components/MediaPlayer/MusicParticles',
    description: 'Animated particle effects for music playback',
    category: 'features',
    usedIn: ['MediaPlayer - visual effects'],
    hasStorybook: false,
  },
  {
    name: 'MiniSpeakerBadge',
    path: '@/components/MediaPlayer/MiniSpeakerBadge',
    description: 'Compact speaker indicator badge',
    category: 'features',
    usedIn: ['MediaPlayer - mini mode'],
    hasStorybook: false,
  },
  {
    name: 'LightHotspot',
    path: '@/features/lighting/components/LightHotspot',
    description: 'Interactive hotspot with tooltip for light control',
    category: 'features',
    props: [
      { name: 'id', type: 'string', required: true },
      { name: 'label', type: 'string', required: true },
      { name: 'position', type: 'object', required: true },
      { name: 'intensity', type: 'number', required: true },
      { name: 'onChange', type: 'function', required: true },
      { name: 'isVisible', type: 'boolean' },
    ],
    usedIn: ['DeskDisplay'],
    hasStorybook: false,
  },
  {
    name: 'ErrorBoundary',
    path: '@/components/ErrorBoundary',
    description: 'Error boundary component for catching React errors',
    category: 'features',
    states: ['normal', 'error'],
    usedIn: ['App.tsx - root error boundary'],
    hasStorybook: true,
    storybookPath: '/errorboundary',
  },
  {
    name: 'LoadingOverlay',
    path: '@/components/LoadingOverlay',
    description: 'Full-screen loading overlay with spinner',
    category: 'features',
    props: [
      { name: 'isLoading', type: 'boolean', required: true },
    ],
    usedIn: ['Index page - initial load'],
    hasStorybook: false,
  },
  {
    name: 'DeviceCategory',
    path: '@/components/settings/DeviceCategory',
    description: 'Grouped device category section in settings',
    category: 'features',
    usedIn: ['DevicesTab'],
    hasStorybook: false,
  },
  {
    name: 'DeviceRow',
    path: '@/components/settings/DeviceRow',
    description: 'Individual device row with edit/delete actions',
    category: 'features',
    usedIn: ['DeviceCategory'],
    hasStorybook: false,
  },
  {
    name: 'SettingsField',
    path: '@/components/settings/SettingsField',
    description: 'Settings form field wrapper',
    category: 'features',
    usedIn: ['ConnectionTab', 'Settings forms'],
    hasStorybook: false,
  },
  {
    name: 'SettingsSection',
    path: '@/components/settings/SettingsSection',
    description: 'Settings section container with title',
    category: 'features',
    usedIn: ['Settings page'],
    hasStorybook: false,
  },
  {
    name: 'RoomSection',
    path: '@/components/settings/RoomSection',
    description: 'Room configuration section in settings',
    category: 'features',
    usedIn: ['DevicesTab'],
    hasStorybook: false,
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
    props: [
      { name: 'currentPath', type: 'string', required: true },
      { name: 'isConnected', type: 'boolean', required: true },
      { name: 'isReconnecting', type: 'boolean', required: true },
      { name: 'onReconnectClick', type: 'function', required: true },
    ],
    usedIn: ['RootLayout'],
    hasStorybook: false,
  },
  {
    name: 'NavigationLinks',
    path: '@/components/navigation/NavigationLinks',
    description: 'Navigation link items with active state',
    category: 'layout',
    props: [
      { name: 'currentPath', type: 'string', required: true },
    ],
    usedIn: ['TopNavigationBar'],
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

// ============= COMPLEX PATTERNS/BLOCKS =============
export interface BlockInfo {
  name: string;
  description: string;
  category: 'navigation' | 'media' | 'display' | 'input' | 'feedback';
  components: string[];
  usedIn: string[];
  features: string[];
}

export const blockRegistry: BlockInfo[] = [
  {
    name: 'Top Navigation Bar',
    description: 'Complete navigation header with logo, navigation links, connection status, and settings',
    category: 'navigation',
    components: ['NavigationLinks', 'ConnectionStatusIndicator', 'Button'],
    usedIn: ['RootLayout - top header'],
    features: ['Route highlighting', 'Connection status', 'Settings access', 'Responsive design'],
  },
  {
    name: 'Media Player',
    description: 'Full-featured Sonos/Spotify media player with playback controls, volume, and speaker selection',
    category: 'media',
    components: ['AlbumArt', 'PlaybackControls', 'VolumeControl', 'ProgressBar', 'SpeakerPopover', 'SourceIndicator'],
    usedIn: ['Index page - sticky bottom player'],
    features: ['Play/Pause/Skip', 'Volume control', 'Progress bar with seek', 'Speaker selection', 'Mini/Full mode', 'Real-time sync'],
  },
  {
    name: 'Light Control Panel',
    description: 'Room lighting control panel with individual light cards and master switch',
    category: 'input',
    components: ['LightControlCard', 'Button (master switch)', 'Slider'],
    usedIn: ['RoomInfoPanel - light controls'],
    features: ['Individual intensity control', 'Master toggle', 'Pending states', 'Error handling', 'Keyboard shortcuts'],
  },
  {
    name: 'Climate Dashboard',
    description: 'Environmental monitoring dashboard with temperature, humidity, and air quality indicators',
    category: 'display',
    components: ['ClimateIndicator', 'CircularProgress', 'Tooltip'],
    usedIn: ['RoomInfoPanel - climate section'],
    features: ['Real-time sensor data', 'Color-coded values', 'Circular progress rings', 'Animated counters'],
  },
  {
    name: 'Interactive Desk Display',
    description: '3D desk visualization with interactive light hotspots and parallax effect',
    category: 'display',
    components: ['DeskDisplay', 'LightHotspot', 'Tooltip'],
    usedIn: ['Index page - central image'],
    features: ['8 lighting states', 'Interactive hotspots', '3D parallax', 'Smooth transitions', 'Ambient glows'],
  },
  {
    name: 'Settings Dialog',
    description: 'Multi-tab settings interface for Home Assistant configuration',
    category: 'input',
    components: ['Dialog', 'Tabs', 'Input', 'Button', 'EntitySearchSelect'],
    usedIn: ['Settings page'],
    features: ['Connection setup', 'Device mapping', 'Entity search', 'Test connection', 'Multi-room support'],
  },
  {
    name: 'Battery Status Row',
    description: 'Device battery monitoring with charging status and circular progress',
    category: 'display',
    components: ['CircularProgress', 'IPhoneIcon', 'AirPodsMaxIcon'],
    usedIn: ['RoomInfoPanel - battery section'],
    features: ['Battery percentage', 'Charging indicator', 'Color-coded status', 'Multiple devices'],
  },
  {
    name: 'Light Hotspot Tooltip',
    description: 'Interactive tooltip with light control on hover over desk image',
    category: 'feedback',
    components: ['Tooltip', 'Popover', 'LightIcon'],
    usedIn: ['DeskDisplay - hotspot interactions'],
    features: ['Directional positioning', 'Mouse tracking', 'Click to toggle', 'Smooth animations', 'Glassmorphism'],
  },
  {
    name: 'Speaker Selection Popover',
    description: 'Dropdown for selecting Spotify Connect sources and Sonos speakers',
    category: 'input',
    components: ['Popover', 'Command', 'Select'],
    usedIn: ['MediaPlayer - speaker selector'],
    features: ['Grouped sources', 'Search/filter', 'Keyboard navigation', 'Current selection highlight'],
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
