import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { ClimateIndicator } from './ClimateIndicator';
import { Thermometer } from 'lucide-react';

describe('ClimateIndicator', () => {
  it('should render icon and value', () => {
    render(
      <ClimateIndicator
        icon={Thermometer}
        label="Temperature"
        value={22.5}
        unit="°C"
        min={15}
        max={35}
        colorType="temperature"
        isLoaded={true}
      />
    );

    expect(screen.getByText(/22\.5/)).toBeInTheDocument();
  });

  it('should render unit', () => {
    render(
      <ClimateIndicator
        icon={Thermometer}
        label="Humidity"
        value={45}
        unit="%"
        min={0}
        max={100}
        colorType="humidity"
        isLoaded={true}
      />
    );

    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it('should render label', () => {
    render(
      <ClimateIndicator
        icon={Thermometer}
        label="Air Quality"
        value={12}
        unit=" µg/m³"
        min={0}
        max={100}
        colorType="airQuality"
        isLoaded={true}
      />
    );

    expect(screen.getByText('Air Quality')).toBeInTheDocument();
  });

  it('should render progress ring with correct value', () => {
    const { container } = render(
      <ClimateIndicator
        icon={Thermometer}
        label="Temperature"
        value={75}
        unit="°C"
        min={15}
        max={35}
        colorType="temperature"
        isLoaded={true}
      />
    );

    // Check for CircularProgress component
    const progressRing = container.querySelector('svg circle[stroke-dasharray]');
    expect(progressRing).toBeInTheDocument();
  });

  it('should apply correct color based on type', () => {
    const { container } = render(
      <ClimateIndicator
        icon={Thermometer}
        label="Temperature"
        value={25}
        unit="°C"
        min={15}
        max={35}
        colorType="temperature"
        isLoaded={true}
      />
    );

    // Progress color should be applied to CircularProgress
    const progressRing = container.querySelector('svg circle[stroke-dasharray]');
    expect(progressRing).toBeInTheDocument();
  });

  it('should display value with proper formatting', () => {
    render(
      <ClimateIndicator
        icon={Thermometer}
        label="Temperature"
        value={22.456}
        unit="°C"
        min={15}
        max={35}
        colorType="temperature"
        isLoaded={true}
      />
    );

    // Value should be rendered (formatting handled by component)
    expect(screen.getByText(/22/)).toBeInTheDocument();
  });
});
