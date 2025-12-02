import type { Meta, StoryObj } from '@storybook/react';
import { ClimateIndicator } from './ClimateIndicator';
import { Thermometer, Droplets, Wind } from 'lucide-react';

const meta = {
  title: 'Features/Climate/ClimateIndicator',
  component: ClimateIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: {
      control: { type: 'number' },
    },
    colorType: {
      control: 'select',
      options: ['temperature', 'humidity', 'airQuality'],
    },
  },
} satisfies Meta<typeof ClimateIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TemperatureCold: Story = {
  args: {
    icon: Thermometer,
    label: 'Temperature',
    value: 17,
    unit: '°C',
    min: 15,
    max: 35,
    colorType: 'temperature',
    isLoaded: true,
  },
};

export const TemperatureComfortable: Story = {
  args: {
    icon: Thermometer,
    label: 'Temperature',
    value: 22,
    unit: '°C',
    min: 15,
    max: 35,
    colorType: 'temperature',
    isLoaded: true,
  },
};

export const TemperatureWarm: Story = {
  args: {
    icon: Thermometer,
    label: 'Temperature',
    value: 28,
    unit: '°C',
    min: 15,
    max: 35,
    colorType: 'temperature',
    isLoaded: true,
  },
};

export const HumidityOptimal: Story = {
  args: {
    icon: Droplets,
    label: 'Humidity',
    value: 50,
    unit: '%',
    min: 0,
    max: 100,
    colorType: 'humidity',
    isLoaded: true,
  },
};

export const HumidityLow: Story = {
  args: {
    icon: Droplets,
    label: 'Humidity',
    value: 25,
    unit: '%',
    min: 0,
    max: 100,
    colorType: 'humidity',
    isLoaded: true,
  },
};

export const HumidityHigh: Story = {
  args: {
    icon: Droplets,
    label: 'Humidity',
    value: 75,
    unit: '%',
    min: 0,
    max: 100,
    colorType: 'humidity',
    isLoaded: true,
  },
};

export const AirQualityGood: Story = {
  args: {
    icon: Wind,
    label: 'PM 2.5',
    value: 8,
    unit: ' µg/m³',
    min: 0,
    max: 100,
    colorType: 'airQuality',
    isLoaded: true,
  },
};

export const AirQualityModerate: Story = {
  args: {
    icon: Wind,
    label: 'PM 2.5',
    value: 25,
    unit: ' µg/m³',
    min: 0,
    max: 100,
    colorType: 'airQuality',
    isLoaded: true,
  },
};

export const AirQualityPoor: Story = {
  args: {
    icon: Wind,
    label: 'PM 2.5',
    value: 65,
    unit: ' µg/m³',
    min: 0,
    max: 100,
    colorType: 'airQuality',
    isLoaded: true,
  },
};

export const Loading: Story = {
  args: {
    icon: Thermometer,
    label: 'Temperature',
    value: 22,
    unit: '°C',
    min: 15,
    max: 35,
    colorType: 'temperature',
    isLoaded: false,
  },
};
