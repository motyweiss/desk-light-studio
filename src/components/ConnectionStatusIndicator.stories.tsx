import type { Meta, StoryObj } from '@storybook/react';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

const meta = {
  title: 'Components/ConnectionStatusIndicator',
  component: ConnectionStatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-6 bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectionStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: {
    isConnected: true,
    isReconnecting: false,
  },
};

export const Disconnected: Story = {
  args: {
    isConnected: false,
    isReconnecting: false,
  },
};

export const Reconnecting: Story = {
  args: {
    isConnected: false,
    isReconnecting: true,
  },
};
