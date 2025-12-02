import { typography } from "../tokens";

export function TypographyShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-light mb-2">Typography</h2>
        <p className="text-muted-foreground">
          Two font families create visual hierarchy and elegant contrast.
        </p>
      </div>

      {/* Display Font */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <div className="mb-4">
          <h3 className="text-xl font-display font-light mb-1">
            {typography.display.font}
          </h3>
          <p className="text-sm text-muted-foreground">
            {typography.display.usage}
          </p>
          <div className="flex gap-2 mt-2">
            {typography.display.weights.map((weight) => (
              <span
                key={weight}
                className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground"
              >
                {weight}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-4 mt-6">
          <p className="text-5xl font-display font-light">
            The quick brown fox jumps
          </p>
          <p className="text-4xl font-display font-light">
            The quick brown fox jumps
          </p>
          <p className="text-3xl font-display font-light">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-2xl font-display">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>

      {/* Body Font */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <div className="mb-4">
          <h3 className="text-xl font-display font-light mb-1">
            {typography.body.font}
          </h3>
          <p className="text-sm text-muted-foreground">
            {typography.body.usage}
          </p>
          <div className="flex gap-2 mt-2">
            {typography.body.weights.map((weight) => (
              <span
                key={weight}
                className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground"
              >
                {weight}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-4 mt-6">
          <p className="text-xl font-light">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-lg font-light">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-base">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-sm">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-xs">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>

      {/* Scale Reference */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <h3 className="text-xl font-display font-light mb-4">Scale Reference</h3>
        <div className="space-y-2">
          <div className="flex items-baseline gap-4">
            <code className="text-xs text-muted-foreground w-20">text-xs</code>
            <span className="text-xs">12px / 0.75rem</span>
          </div>
          <div className="flex items-baseline gap-4">
            <code className="text-xs text-muted-foreground w-20">text-sm</code>
            <span className="text-sm">14px / 0.875rem</span>
          </div>
          <div className="flex items-baseline gap-4">
            <code className="text-xs text-muted-foreground w-20">text-base</code>
            <span className="text-base">16px / 1rem</span>
          </div>
          <div className="flex items-baseline gap-4">
            <code className="text-xs text-muted-foreground w-20">text-lg</code>
            <span className="text-lg">18px / 1.125rem</span>
          </div>
          <div className="flex items-baseline gap-4">
            <code className="text-xs text-muted-foreground w-20">text-xl</code>
            <span className="text-xl">20px / 1.25rem</span>
          </div>
          <div className="flex items-baseline gap-4">
            <code className="text-xs text-muted-foreground w-20">text-2xl</code>
            <span className="text-2xl">24px / 1.5rem</span>
          </div>
          <div className="flex items-baseline gap-4">
            <code className="text-xs text-muted-foreground w-20">text-3xl</code>
            <span className="text-3xl">30px / 1.875rem</span>
          </div>
        </div>
      </div>
    </div>
  );
}
