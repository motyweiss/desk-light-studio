import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PAGE_TRANSITIONS } from "@/lib/animations/tokens";
import {
  Sidebar,
  ColorPalette,
  TypographyShowcase,
  SpacingScale,
  AnimationPreview,
  ComponentShowcase,
  IconGallery,
  BlocksShowcase,
  UsageMap,
  searchComponents,
} from "@/design-system";

export default function DesignSystem() {
  const [activeSection, setActiveSection] = useState("colors");
  const [searchQuery, setSearchQuery] = useState("");

  const renderSection = () => {
    if (searchQuery) {
      const results = searchComponents(searchQuery);
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-display font-light mb-2">
              Search Results
            </h2>
            <p className="text-muted-foreground">
              Found {results.length} component{results.length !== 1 ? "s" : ""}{" "}
              matching "{searchQuery}"
            </p>
          </div>
          <div className="space-y-6">
            {results.map((component) => (
              <div
                key={component.name}
                className="border border-border rounded-lg p-4 bg-card/30 backdrop-blur-sm"
              >
                <h3 className="text-xl font-display font-light mb-1">
                  {component.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {component.description}
                </p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                    {component.category}
                  </span>
                  <code className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground font-mono">
                    {component.path}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case "colors":
        return <ColorPalette />;
      case "typography":
        return <TypographyShowcase />;
      case "spacing":
        return <SpacingScale />;
      case "animations":
        return <AnimationPreview />;
      case "primitives":
        return <ComponentShowcase category="primitives" />;
      case "features":
        return <ComponentShowcase category="features" />;
      case "layout":
        return <ComponentShowcase category="layout" />;
      case "icons":
        return <IconGallery />;
      case "blocks":
        return <BlocksShowcase />;
      case "navigation-blocks":
        return <BlocksShowcase category="navigation" />;
      case "media-blocks":
        return <BlocksShowcase category="media" />;
      case "display-blocks":
        return <BlocksShowcase category="display" />;
      case "input-blocks":
        return <BlocksShowcase category="input" />;
      case "feedback-blocks":
        return <BlocksShowcase category="feedback" />;
      case "usage-map":
        return <UsageMap />;
      default:
        return <ColorPalette />;
    }
  };

  return (
    <motion.div 
      className="flex min-h-screen bg-background"
      initial={{ opacity: 0, scale: PAGE_TRANSITIONS.scale.enter }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: PAGE_TRANSITIONS.scale.exit }}
      transition={{
        duration: PAGE_TRANSITIONS.duration,
        ease: PAGE_TRANSITIONS.ease,
      }}
      style={{ 
        transformOrigin: 'center center',
        willChange: 'opacity, transform',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setSearchQuery("");
        }}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header with Search */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-8 py-8">{renderSection()}</div>
      </div>
    </motion.div>
  );
}
