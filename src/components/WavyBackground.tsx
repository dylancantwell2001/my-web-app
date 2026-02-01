import { useState, useEffect, useCallback } from "react";
import backgroundImage from "@/assets/background.jpg";

const WavyBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Calculate mouse position as percentage of viewport
    const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Subtle parallax offset (max 15px movement)
  const offsetX = mousePosition.x * 15;
  const offsetY = mousePosition.y * 15;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute inset-[-30px] transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(1.05)`,
        }}
      >
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover blur-[32px]"
        />
      </div>
      {/* Dark overlay for better content readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};

export default WavyBackground;
