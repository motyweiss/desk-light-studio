import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { colors } from "../tokens";

export function ColorPalette() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (color: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colorGroups = [
    {
      title: "Base Colors",
      colors: [
        { name: "Background", key: "background", value: colors.background },
        { name: "Foreground", key: "foreground", value: colors.foreground },
      ],
    },
    {
      title: "Brand Colors",
      colors: [
        { name: "Primary", key: "primary", value: colors.primary },
        { name: "Primary Foreground", key: "primaryForeground", value: colors.primaryForeground },
        { name: "Accent", key: "accent", value: colors.accent },
        { name: "Accent Foreground", key: "accentForeground", value: colors.accentForeground },
      ],
    },
    {
      title: "UI Colors",
      colors: [
        { name: "Card", key: "card", value: colors.card },
        { name: "Popover", key: "popover", value: colors.popover },
        { name: "Muted", key: "muted", value: colors.muted },
        { name: "Muted Foreground", key: "mutedForeground", value: colors.mutedForeground },
        { name: "Border", key: "border", value: colors.border },
        { name: "Input", key: "input", value: colors.input },
      ],
    },
    {
      title: "Warm Glow Colors",
      colors: [
        { name: "Warm Glow", key: "warmGlow", value: colors.warmGlow },
        { name: "Warm Glow Soft", key: "warmGlowSoft", value: colors.warmGlowSoft },
        { name: "Shadow Warm", key: "shadowWarm", value: colors.shadowWarm },
        { name: "Spotlight Glow", key: "spotlightGlow", value: colors.spotlightGlow },
        { name: "Lamp Glow", key: "lampGlow", value: colors.lampGlow },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-light mb-2">Colors</h2>
        <p className="text-muted-foreground">
          All colors use HSL format for consistent theming across the application.
        </p>
      </div>

      {colorGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-xl font-display font-light mb-4">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.colors.map((color) => (
              <div
                key={color.key}
                className="border border-border rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors"
              >
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: color.value }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{color.name}</span>
                    <button
                      onClick={() => copyToClipboard(color.key, color.value)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedColor === color.key ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <code className="text-xs text-muted-foreground font-mono">
                    {color.value}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
