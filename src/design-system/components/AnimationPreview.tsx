import { motion } from "framer-motion";
import { useState } from "react";
import { Play } from "lucide-react";
import { animation } from "../tokens";
import { Button } from "@/components/ui/button";

export function AnimationPreview() {
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  const easingCurves = Object.entries(animation.easing);
  const durations = Object.entries(animation.duration);

  const playAnimation = (key: string) => {
    setActiveAnimation(key);
    setTimeout(() => setActiveAnimation(null), 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-light mb-2">Animations</h2>
        <p className="text-muted-foreground">
          Consistent easing curves and durations for smooth, cohesive animations.
        </p>
      </div>

      {/* Easing Curves */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <h3 className="text-xl font-display font-light mb-4">Easing Curves</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {easingCurves.map(([key, value]) => (
            <div
              key={key}
              className="border border-border/50 rounded-lg p-4 bg-card/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <code className="text-sm font-medium">{key}</code>
                  <p className="text-xs text-muted-foreground mt-1">
                    cubic-bezier({value.join(", ")})
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => playAnimation(key)}
                  className="h-8 w-8"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-12 bg-muted/20 rounded relative overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-12 bg-primary/40 rounded"
                  initial={{ x: 0 }}
                  animate={
                    activeAnimation === key
                      ? { x: "calc(100% + 200px)" }
                      : { x: 0 }
                  }
                  transition={{
                    duration: 1.2,
                    ease: value as any,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Durations */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <h3 className="text-xl font-display font-light mb-4">Durations</h3>
        <div className="space-y-3">
          {durations.map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <code className="text-sm text-muted-foreground w-32">{key}</code>
              <span className="text-sm w-16">{value}s</span>
              <div className="flex-1 h-2 bg-muted/20 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-primary/40"
                  initial={{ width: "0%" }}
                  animate={
                    activeAnimation === key
                      ? { width: "100%" }
                      : { width: "0%" }
                  }
                  transition={{ duration: value, ease: "linear" }}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => playAnimation(key)}
                className="h-8 w-8"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Light Animation System */}
      <div className="border border-border rounded-lg p-6 bg-card/30 backdrop-blur-sm">
        <h3 className="text-xl font-display font-light mb-4">
          Light Animation System
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Unified timing system for all light-related animations across the app.
        </p>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Turn On</span>
              <span className="text-xs text-muted-foreground">
                {animation.lightAnimation.turnOn.duration}s
              </span>
            </div>
            <div className="h-12 bg-muted/20 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-primary/60 rounded"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  activeAnimation === "turnOn"
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.9 }
                }
                transition={{
                  duration: animation.lightAnimation.turnOn.duration,
                  ease: animation.lightAnimation.turnOn.ease as any,
                }}
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playAnimation("turnOn")}
              className="mt-2"
            >
              <Play className="h-3 w-3 mr-2" />
              Preview
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Turn Off</span>
              <span className="text-xs text-muted-foreground">
                {animation.lightAnimation.turnOff.duration}s
              </span>
            </div>
            <div className="h-12 bg-muted/20 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-primary/60 rounded"
                initial={{ opacity: 1, scale: 1 }}
                animate={
                  activeAnimation === "turnOff"
                    ? { opacity: 0, scale: 0.9 }
                    : { opacity: 1, scale: 1 }
                }
                transition={{
                  duration: animation.lightAnimation.turnOff.duration,
                  ease: animation.lightAnimation.turnOff.ease as any,
                }}
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playAnimation("turnOff")}
              className="mt-2"
            >
              <Play className="h-3 w-3 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
