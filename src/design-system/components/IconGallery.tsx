import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { componentRegistry } from "../registry";
import { HueGoIcon, HueWallSpotIcon, HueRoomComputerIcon } from "@/components/icons/LightIcons";
import { ServiceIcon } from "@/components/icons/ServiceIcons";
import { IPhoneIcon } from "@/components/icons/IPhoneIcon";
import { AirPodsMaxIcon } from "@/components/icons/AirPodsMaxIcon";

export function IconGallery() {
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  const iconComponents = componentRegistry.filter((c) => c.category === "icons");

  const copyImport = (name: string, path: string) => {
    const code = `import { ${name} } from "${path}";`;
    navigator.clipboard.writeText(code);
    setCopiedIcon(name);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  const customIcons = [
    {
      name: "HueGoIcon",
      path: "@/components/icons/LightIcons",
      component: () => <HueGoIcon className="h-8 w-8" />,
    },
    {
      name: "HueWallSpotIcon",
      path: "@/components/icons/LightIcons",
      component: () => <HueWallSpotIcon className="h-8 w-8" />,
    },
    {
      name: "HueRoomComputerIcon",
      path: "@/components/icons/LightIcons",
      component: () => <HueRoomComputerIcon className="h-8 w-8" />,
    },
    {
      name: "ServiceIcon",
      path: "@/components/icons/ServiceIcons",
      description: "Dynamic service icon (Spotify, Apple Music, YouTube, Amazon)",
      component: () => <ServiceIcon appName="Spotify" className="h-8 w-8" />,
    },
    {
      name: "IPhoneIcon",
      path: "@/components/icons/IPhoneIcon",
      component: () => <IPhoneIcon className="h-8 w-8" />,
    },
    {
      name: "AirPodsMaxIcon",
      path: "@/components/icons/AirPodsMaxIcon",
      component: () => <AirPodsMaxIcon className="h-8 w-8" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-light mb-2">Icons</h2>
        <p className="text-muted-foreground">
          Custom SVG icons used throughout the application. Most icons use Lucide
          React for consistency.
        </p>
      </div>

      {/* Custom Icons */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <h3 className="text-xl font-display font-light mb-4">Custom Icons</h3>
        <div className="space-y-6">
          {customIcons.map((icon) => (
            <div
              key={icon.name}
              className="border border-border/50 rounded-lg p-4 bg-card/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium">{icon.name}</h4>
                  <code className="text-xs text-muted-foreground">
                    {icon.path}
                  </code>
                </div>
                <button
                  onClick={() => copyImport(icon.name, icon.path)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedIcon === icon.name ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center p-6 rounded bg-background/50">
                {icon.component()}
              </div>
              {'description' in icon && icon.description && (
                <p className="text-xs text-muted-foreground mt-2">
                  {icon.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lucide Icons Reference */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <h3 className="text-xl font-display font-light mb-2">
          Lucide React Icons
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Most UI icons use{" "}
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Lucide React
          </a>
          . Import directly from the library:
        </p>
        <code className="text-xs bg-muted/50 px-3 py-2 rounded block">
          import {`{ IconName }`} from "lucide-react";
        </code>
      </div>
    </div>
  );
}
