import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { LightControlCard } from './LightControlCard';

const meta = {
  title: 'Features/Lighting/LightControlCard',
  component: LightControlCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px] p-6 bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    intensity: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
  args: {
    onChange: fn(),
    onHover: fn(),
  },
} satisfies Meta<typeof LightControlCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: {
    id: 'spotlight',
    label: 'Spotlight',
    intensity: 0,
    isPending: false,
    onHover: fn(),
  },
};

export const PartiallyOn: Story = {
  args: {
    id: 'desk-lamp',
    label: 'Desk Lamp',
    intensity: 45,
    isPending: false,
    onHover: fn(),
  },
};

export const FullyOn: Story = {
  args: {
    id: 'monitor',
    label: 'Monitor Light',
    intensity: 100,
    isPending: false,
    onHover: fn(),
  },
};

export const Pending: Story = {
  args: {
    id: 'spotlight',
    label: 'Spotlight',
    intensity: 75,
    isPending: true,
    onHover: fn(),
  },
};

export const WithMediumIntensity: Story = {
  args: {
    id: 'desk-lamp',
    label: 'Desk Lamp',
    intensity: 60,
    isPending: false,
    onHover: fn(),
  },
};

export const Interactive: Story = {
  args: {
    id: 'monitor',
    label: 'Monitor Light',
    intensity: 50,
    isPending: false,
    onHover: fn(),
  },
  play: async ({ canvasElement }) => {
    // Interactive test - can be expanded with @storybook/test
  },
};
