import { Copy, ExternalLink, Check } from "lucide-react";
import { ReactNode, useState } from "react";
import { ComponentInfo } from "../registry";

interface ComponentCardProps {
  component: ComponentInfo;
  children?: ReactNode;
}

export function ComponentCard({ component, children }: ComponentCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const importCode = `import { ${component.name} } from "${component.path}";`;

  const copyCode = () => {
    navigator.clipboard.writeText(importCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-2xl font-display font-light">{component.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {component.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {component.hasStorybook && component.storybookPath && (
              <a
                href={`/storybook/?path=/story${component.storybookPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground">
            {component.category}
          </span>
          {component.hasStorybook && (
            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
              Has Storybook
            </span>
          )}
          {component.variants && (
            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
              {component.variants.length} variants
            </span>
          )}
          {component.states && (
            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
              {component.states.length} states
            </span>
          )}
        </div>
      </div>

      {/* Usage Locations */}
      {component.usedIn.length > 0 && (
        <div className="px-6 py-4 bg-muted/20 border-b border-border">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Used In
          </h4>
          <div className="flex flex-wrap gap-2">
            {component.usedIn.map((location, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded bg-card/50 text-foreground"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {children && (
        <div className="p-6 border-b border-border">
          <h4 className="text-sm font-medium mb-4">Preview</h4>
          <div className="bg-background/50 rounded-lg p-6">{children}</div>
        </div>
      )}

      {/* Props Table */}
      {component.props && component.props.length > 0 && (
        <div className="px-6 py-4 border-b border-border">
          <h4 className="text-sm font-medium mb-3">Props</h4>
          <div className="space-y-2">
            {component.props.map((prop) => (
              <div
                key={prop.name}
                className="flex items-start gap-4 text-sm border-b border-border/50 pb-2 last:border-0"
              >
                <code className="text-primary font-mono min-w-[120px]">
                  {prop.name}
                  {prop.required && <span className="text-destructive">*</span>}
                </code>
                <span className="text-muted-foreground min-w-[80px]">
                  {prop.type}
                </span>
                <div className="flex-1">
                  {prop.description && (
                    <p className="text-muted-foreground text-xs mb-1">
                      {prop.description}
                    </p>
                  )}
                  {prop.default && (
                    <span className="text-xs text-muted-foreground">
                      Default: <code className="text-xs">{prop.default}</code>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import Code */}
      <div className="p-4 bg-muted/10">
        <div className="flex items-center justify-between">
          <code className="text-xs font-mono text-muted-foreground">
            {importCode}
          </code>
          <button
            onClick={copyCode}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedCode ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
