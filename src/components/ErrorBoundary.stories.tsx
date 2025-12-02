import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[400px] p-6 bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('This is a simulated error for Storybook demonstration');
  }
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h2 className="text-2xl font-bold text-foreground">No Error</h2>
      <p className="text-muted-foreground">The component is working correctly</p>
    </div>
  );
};

export const NoError: Story = {
  args: {
    children: <ThrowError shouldThrow={false} />,
  },
};

export const WithError: Story = {
  args: {
    children: <ThrowError shouldThrow={true} />,
  },
};

export const CustomFallback: Story = {
  args: {
    fallback: (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <div className="text-6xl">🚨</div>
        <h2 className="text-2xl font-bold text-destructive">Custom Error UI</h2>
        <p className="text-muted-foreground text-center">
          This is a custom fallback component that can be provided to the ErrorBoundary
        </p>
        <Button variant="outline">Custom Action</Button>
      </div>
    ),
    children: <ThrowError shouldThrow={true} />,
  },
};
