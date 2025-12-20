import { useEffect, useState, useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface TimelineParticlesProps {
  direction: "past" | "future" | "idle";
  intensity?: number;
}

const TimelineParticles = ({ direction, intensity = 1 }: TimelineParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);

  // Generate new particles when direction changes
  useEffect(() => {
    if (direction === "idle") {
      // Slowly fade out existing particles
      return;
    }

    const createParticle = (): Particle => {
      particleIdRef.current += 1;
      return {
        id: particleIdRef.current,
        x: Math.random() * 100,
        y: 20 + Math.random() * 60, // Concentrate in middle area
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
        speed: 0.5 + Math.random() * 1.5,
      };
    };

    // Burst of particles on direction change
    const burstCount = Math.floor(5 * intensity);
    const newParticles = Array.from({ length: burstCount }, createParticle);
    setParticles(prev => [...prev.slice(-20), ...newParticles]);

    // Continue spawning while direction is active
    const spawnInterval = setInterval(() => {
      setParticles(prev => {
        if (prev.length > 25) return prev.slice(-20);
        return [...prev, createParticle()];
      });
    }, 200);

    return () => clearInterval(spawnInterval);
  }, [direction, intensity]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animationInterval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: direction === "past" ? p.x - p.speed : direction === "future" ? p.x + p.speed : p.x,
            opacity: p.opacity * 0.98, // Fade out
          }))
          .filter(p => p.opacity > 0.05 && p.x > -5 && p.x < 105)
      );
    }, 50);

    return () => clearInterval(animationInterval);
  }, [direction, particles.length]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `translate(-50%, -50%)`,
            transition: "left 50ms linear, opacity 50ms linear",
          }}
        />
      ))}
    </div>
  );
};

export default TimelineParticles;
