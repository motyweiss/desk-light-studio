import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Slider } from './slider';
import { useState } from 'react';

const meta = {
  title: 'UI/Slider',
  component: Slider,
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
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
};

export const WithCustomRange: Story = {
  args: {
    defaultValue: [25],
    min: 0,
    max: 50,
    step: 5,
  },
};

export const MultipleValues: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    disabled: true,
  },
};

const ControlledSlider = () => {
  const [value, setValue] = useState([50]);
  
  return (
    <div className="space-y-4">
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
      />
      <div className="text-center text-sm text-muted-foreground">
        Value: {value[0]}%
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledSlider />,
};
