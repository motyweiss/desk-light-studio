import { spacing } from "../tokens";

export function SpacingScale() {
  const spacingEntries = Object.entries(spacing);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-light mb-2">Spacing</h2>
        <p className="text-muted-foreground">
          Consistent spacing scale for layout and component spacing.
        </p>
      </div>

      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <div className="space-y-6">
          {spacingEntries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-6">
              <div className="w-20 text-right">
                <code className="text-sm text-muted-foreground">{key}</code>
              </div>
              <div className="w-16 text-right">
                <span className="text-sm text-muted-foreground">{value}px</span>
              </div>
              <div className="flex-1">
                <div
                  className="bg-primary/20 border border-primary/40 h-8 rounded"
                  style={{ width: `${value}px` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <h3 className="text-xl font-display font-light mb-4">Usage Examples</h3>
        <div className="space-y-4">
          <div>
            <code className="text-xs text-muted-foreground mb-2 block">gap-2 (8px)</code>
            <div className="flex gap-2">
              <div className="w-12 h-12 bg-primary/20 rounded" />
              <div className="w-12 h-12 bg-primary/20 rounded" />
              <div className="w-12 h-12 bg-primary/20 rounded" />
            </div>
          </div>
          <div>
            <code className="text-xs text-muted-foreground mb-2 block">gap-4 (16px)</code>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded" />
              <div className="w-12 h-12 bg-primary/20 rounded" />
              <div className="w-12 h-12 bg-primary/20 rounded" />
            </div>
          </div>
          <div>
            <code className="text-xs text-muted-foreground mb-2 block">gap-8 (32px)</code>
            <div className="flex gap-8">
              <div className="w-12 h-12 bg-primary/20 rounded" />
              <div className="w-12 h-12 bg-primary/20 rounded" />
              <div className="w-12 h-12 bg-primary/20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
