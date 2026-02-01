import { useState, useEffect, useCallback } from "react";
import backgroundImage from "@/assets/background.jpg";
import { Eye, EyeOff } from "lucide-react";

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

  const [isBlurred, setIsBlurred] = useState(true);

  return (
    <>
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
            className={`w-full h-full object-cover transition-all duration-700 ${isBlurred ? "blur-[32px]" : "blur-0"}`}
          />
        </div>
        {/* Dark overlay for better content readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <button
        onClick={() => setIsBlurred(!isBlurred)}
        className="fixed bottom-4 left-4 z-50 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-primary/70 hover:text-primary backdrop-blur-md pointer-events-auto"
        title={isBlurred ? "Remove blur" : "Enable blur"}
      >
        {isBlurred ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>
    </>
  );
};

export default WavyBackground;
