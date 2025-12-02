import { useState } from "react";
import { componentRegistry } from "../registry";
import { FileCode, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export function UsageMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Create usage map by location
  const usageMap = componentRegistry.reduce((acc, component) => {
    component.usedIn.forEach((location) => {
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push({
        name: component.name,
        category: component.category,
        path: component.path,
      });
    });
    return acc;
  }, {} as Record<string, Array<{ name: string; category: string; path: string }>>);

  const locations = Object.keys(usageMap).sort();
  const filteredLocations = searchQuery
    ? locations.filter((loc) =>
        loc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locations;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "primitives":
        return "bg-blue-500/10 text-blue-400";
      case "features":
        return "bg-purple-500/10 text-purple-400";
      case "layout":
        return "bg-green-500/10 text-green-400";
      case "icons":
        return "bg-orange-500/10 text-orange-400";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-light mb-2">Usage Map</h2>
        <p className="text-muted-foreground">
          Visual map of where components are used throughout the application.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by page or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-border rounded-lg p-4 bg-card/30 backdrop-blur-sm">
          <div className="text-2xl font-display font-light mb-1">
            {locations.length}
          </div>
          <div className="text-xs text-muted-foreground">Total Locations</div>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card/30 backdrop-blur-sm">
          <div className="text-2xl font-display font-light mb-1">
            {componentRegistry.length}
          </div>
          <div className="text-xs text-muted-foreground">Components</div>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card/30 backdrop-blur-sm">
          <div className="text-2xl font-display font-light mb-1">
            {componentRegistry.filter((c) => c.hasStorybook).length}
          </div>
          <div className="text-xs text-muted-foreground">With Storybook</div>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card/30 backdrop-blur-sm">
          <div className="text-2xl font-display font-light mb-1">
            {
              componentRegistry.filter((c) => c.category === "features")
                .length
            }
          </div>
          <div className="text-xs text-muted-foreground">Feature Components</div>
        </div>
      </div>

      {/* Usage Map */}
      <div className="space-y-4">
        {filteredLocations.map((location) => (
          <div
            key={location}
            className="border border-border rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm"
          >
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <FileCode className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{location}</h3>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                  {usageMap[location].length} components
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {usageMap[location].map((component) => (
                  <div
                    key={component.name}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-background/50 border border-border/50"
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(
                        component.category
                      )}`}
                    >
                      {component.category}
                    </span>
                    <span className="text-sm font-medium">
                      {component.name}
                    </span>
                    <code className="text-xs text-muted-foreground font-mono">
                      {component.path}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
