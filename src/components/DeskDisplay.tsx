import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Import all 8 lighting state images
import desk000 from "@/assets/desk-000.png";
import desk001 from "@/assets/desk-001.png";
import desk010 from "@/assets/desk-010.png";
import desk011 from "@/assets/desk-011.png";
import desk100 from "@/assets/desk-100.png";
import desk101 from "@/assets/desk-101.png";
import desk110 from "@/assets/desk-110.png";
import desk111 from "@/assets/desk-111.png";

interface DeskDisplayProps {
  spotlight: boolean;
  deskLamp: boolean;
  monitorLight: boolean;
}

const lightingStates = {
  "000": desk000,
  "001": desk001,
  "010": desk010,
  "011": desk011,
  "100": desk100,
  "101": desk101,
  "110": desk110,
  "111": desk111,
};

export const DeskDisplay = ({ spotlight, deskLamp, monitorLight }: DeskDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation for parallax
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 30 });

  // Calculate current lighting state
  const getCurrentState = () => {
    const spotlightBit = spotlight ? "1" : "0";
    const deskLampBit = deskLamp ? "1" : "0";
    const monitorLightBit = monitorLight ? "1" : "0";
    return `${spotlightBit}${deskLampBit}${monitorLightBit}`;
  };

  const currentState = getCurrentState();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate offset from center (-1 to 1)
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);

    // Apply parallax (movement in opposite direction)
    mouseX.set(offsetX * -15);
    mouseY.set(offsetY * -10);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl aspect-square rounded-[3rem] overflow-hidden bg-container-bg shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          x: smoothX,
          y: smoothY,
        }}
      >
        {/* Stack all 8 images and control visibility via opacity */}
        {Object.entries(lightingStates).map(([state, image]) => (
          <motion.img
            key={state}
            src={image}
            alt={`Desk lighting state ${state}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: state === currentState ? 1 : 0 
            }}
            transition={{ 
              duration: 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
