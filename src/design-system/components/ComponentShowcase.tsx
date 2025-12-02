import { ComponentCard } from "./ComponentCard";
import { getComponentsByCategory } from "../registry";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { LightControlCard } from "@/features/lighting/components/LightControlCard";
import { ClimateIndicator } from "@/features/climate/components/ClimateIndicator";
import { Thermometer, Droplets, type LucideIcon } from "lucide-react";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";

interface ComponentShowcaseProps {
  category: "primitives" | "features" | "layout";
}

export function ComponentShowcase({ category }: ComponentShowcaseProps) {
  const components = getComponentsByCategory(category);

  const getComponentPreview = (name: string) => {
    switch (name) {
      case "Button":
        return (
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button size="sm" variant="primary">
              Small
            </Button>
            <Button size="lg" variant="primary">
              Large
            </Button>
          </div>
        );

      case "Slider":
        return (
          <div className="space-y-4">
            <Slider defaultValue={[33]} max={100} step={1} className="w-[300px]" />
            <Slider defaultValue={[50]} max={100} step={1} className="w-[300px]" />
            <Slider defaultValue={[75]} max={100} step={1} className="w-[300px]" />
          </div>
        );

      case "Input":
        return (
          <div className="space-y-4 w-[300px]">
            <Input placeholder="Enter text..." />
            <Input placeholder="With value" value="Example text" readOnly />
            <Input placeholder="Disabled" disabled />
          </div>
        );

      case "LightControlCard":
        return (
          <div className="space-y-4 w-[320px]">
            <LightControlCard
              id="demo-off"
              label="Off State"
              intensity={0}
              onChange={() => {}}
              onHover={() => {}}
            />
            <LightControlCard
              id="demo-on"
              label="On State"
              intensity={75}
              onChange={() => {}}
              onHover={() => {}}
            />
            <LightControlCard
              id="demo-pending"
              label="Pending State"
              intensity={50}
              isPending={true}
              onChange={() => {}}
              onHover={() => {}}
            />
            <LightControlCard
              id="demo-loading"
              label="Loading State"
              intensity={0}
              isLoading={true}
              onChange={() => {}}
              onHover={() => {}}
            />
          </div>
        );

      case "ClimateIndicator":
        return (
          <div className="flex gap-6">
            <ClimateIndicator
              icon={Thermometer as LucideIcon}
              label="Temperature"
              value={22.5}
              unit="°C"
              min={15}
              max={35}
              colorType="temperature"
              isLoaded={true}
            />
            <ClimateIndicator
              icon={Droplets as LucideIcon}
              label="Humidity"
              value={45}
              unit="%"
              min={0}
              max={100}
              colorType="humidity"
              isLoaded={true}
            />
          </div>
        );

      case "ConnectionStatusIndicator":
        return (
          <div className="flex gap-4">
            <ConnectionStatusIndicator isConnected={true} inline={true} />
            <ConnectionStatusIndicator isConnected={false} inline={true} onReconnectClick={() => {}} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-light mb-2 capitalize">
          {category === "primitives"
            ? "UI Primitives"
            : category === "features"
            ? "Feature Components"
            : "Layout Components"}
        </h2>
        <p className="text-muted-foreground">
          {category === "primitives"
            ? "Basic UI building blocks from shadcn/ui."
            : category === "features"
            ? "Complex feature-specific components with business logic."
            : "Page layout and structural components."}
        </p>
      </div>

      <div className="space-y-6">
        {components.map((component) => (
          <ComponentCard key={component.name} component={component}>
            {getComponentPreview(component.name)}
          </ComponentCard>
        ))}
      </div>
    </div>
  );
}
