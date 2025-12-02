import { Palette, Type, Ruler, Zap, Box, Layout, Image, Wrench } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  {
    title: "Foundation",
    icon: Palette,
    items: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "spacing", label: "Spacing" },
      { id: "animations", label: "Animations" },
    ],
  },
  {
    title: "Components",
    icon: Box,
    items: [
      { id: "primitives", label: "UI Primitives" },
      { id: "features", label: "Feature Components" },
      { id: "layout", label: "Layout Components" },
    ],
  },
  {
    title: "Patterns",
    icon: Layout,
    items: [
      { id: "blocks", label: "All Blocks" },
      { id: "navigation-blocks", label: "Navigation" },
      { id: "media-blocks", label: "Media" },
      { id: "display-blocks", label: "Display" },
      { id: "input-blocks", label: "Input" },
      { id: "feedback-blocks", label: "Feedback" },
    ],
  },
  {
    title: "Assets",
    icon: Image,
    items: [
      { id: "icons", label: "Icons" },
    ],
  },
  {
    title: "Tools",
    icon: Wrench,
    items: [
      { id: "usage-map", label: "Usage Map" },
    ],
  },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-card/30 backdrop-blur-xl h-screen overflow-y-auto sticky top-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-display font-light text-foreground">
          Design System
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Components & Tokens
        </p>
      </div>

      <nav className="p-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="mb-6">
              <div className="flex items-center gap-2 px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Icon className="h-3 w-3" />
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
