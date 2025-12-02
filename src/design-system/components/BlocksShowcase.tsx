import { blockRegistry, type BlockInfo } from "../registry";
import { ExternalLink, Package, Zap } from "lucide-react";
import { TopNavigationBar } from "@/components/navigation/TopNavigationBar";
import { MediaPlayer } from "@/components/MediaPlayer/MediaPlayer";
import { RoomInfoPanel } from "@/components/RoomInfoPanel";
import { DeskDisplay } from "@/features/lighting/components/DeskDisplay";
import { useState } from "react";
import { ClimateIndicators } from "@/features/climate/components/ClimateIndicators";

interface BlocksShowcaseProps {
  category?: BlockInfo["category"];
}

export function BlocksShowcase({ category }: BlocksShowcaseProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  
  const blocks = category
    ? blockRegistry.filter((b) => b.category === category)
    : blockRegistry;

  const getCategoryColor = (cat: BlockInfo["category"]) => {
    switch (cat) {
      case "navigation":
        return "bg-blue-500/10 text-blue-400";
      case "media":
        return "bg-purple-500/10 text-purple-400";
      case "display":
        return "bg-green-500/10 text-green-400";
      case "input":
        return "bg-orange-500/10 text-orange-400";
      case "feedback":
        return "bg-pink-500/10 text-pink-400";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  const getBlockPreview = (name: string) => {
    switch (name) {
      case "Top Navigation Bar":
        return (
          <div className="w-full border border-border rounded-lg overflow-hidden">
            <TopNavigationBar 
              currentPath="/"
              isConnected={true}
              isReconnecting={false}
              onReconnectClick={() => {}}
            />
          </div>
        );

      case "Media Player":
        return (
          <div className="w-full max-w-4xl mx-auto">
            <MediaPlayer />
          </div>
        );

      case "Climate Dashboard":
        return (
          <div className="bg-background/50 p-6 rounded-lg">
            <ClimateIndicators />
          </div>
        );

      case "Light Control Panel":
        return (
          <div className="w-[350px]">
            <RoomInfoPanel
              roomName="Office"
              masterSwitchOn={true}
              onMasterToggle={() => {}}
              onLightHover={() => {}}
              isLoaded={true}
              lights={[
                { id: "spotlight", label: "Spotlight", intensity: 75, onChange: () => {} },
                { id: "deskLamp", label: "Desk Lamp", intensity: 60, onChange: () => {} },
                { id: "monitorLight", label: "Monitor Light", intensity: 0, onChange: () => {} },
              ]}
            />
          </div>
        );

      case "Interactive Desk Display":
        const [spotlight, setSpotlight] = useState(75);
        const [deskLamp, setDeskLamp] = useState(50);
        const [monitor, setMonitor] = useState(0);
        
        return (
          <div className="w-full max-w-2xl mx-auto">
            <DeskDisplay
              spotlightIntensity={spotlight}
              deskLampIntensity={deskLamp}
              monitorLightIntensity={monitor}
              onSpotlightChange={setSpotlight}
              onDeskLampChange={setDeskLamp}
              onMonitorLightChange={setMonitor}
              hoveredLightId={null}
              isLoaded={true}
            />
          </div>
        );

      default:
        return (
          <div className="bg-muted/20 rounded-lg p-8 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Preview not available for this block</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-light mb-2">
          {category
            ? `${category.charAt(0).toUpperCase() + category.slice(1)} Blocks`
            : "Pattern Blocks"}
        </h2>
        <p className="text-muted-foreground">
          Complex UI patterns composed of multiple components working together.
        </p>
      </div>

      <div className="space-y-6">
        {blocks.map((block) => (
          <div
            key={block.name}
            className="border border-border rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-display font-light">
                      {block.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getCategoryColor(
                        block.category
                      )}`}
                    >
                      {block.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {block.description}
                  </p>
                </div>
              </div>

              {/* Components Used */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Components Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {block.components.map((comp) => (
                    <span
                      key={comp}
                      className="text-xs px-2 py-1 rounded bg-muted/50 text-foreground font-mono"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Features
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {block.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Zap className="h-3 w-3 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Locations */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Used In
                </h4>
                <div className="flex flex-wrap gap-2">
                  {block.usedIn.map((location, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-card/50 text-foreground"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-background/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">Live Preview</h4>
                <button
                  onClick={() =>
                    setSelectedBlock(
                      selectedBlock === block.name ? null : block.name
                    )
                  }
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {selectedBlock === block.name ? "Hide" : "Show"} Preview
                </button>
              </div>

              {selectedBlock === block.name && (
                <div className="bg-background rounded-lg p-6 min-h-[200px] flex items-center justify-center overflow-auto">
                  {getBlockPreview(block.name)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
