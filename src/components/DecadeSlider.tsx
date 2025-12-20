import { useState, useRef, useEffect } from "react";
import { type TimePeriod } from "@/lib/api";
import { Slider } from "@/components/ui/slider";
import TimelineParticles from "./TimelineParticles";

interface DecadeSliderProps {
  timePeriods: TimePeriod[];
  selectedDecade: TimePeriod;
  onDecadeChange: (decade: TimePeriod) => void;
}

const DecadeSlider = ({ timePeriods, selectedDecade, onDecadeChange }: DecadeSliderProps) => {
  const currentIndex = timePeriods.indexOf(selectedDecade);
  const [particleDirection, setParticleDirection] = useState<"past" | "future" | "idle">("idle");
  const lastIndexRef = useRef(currentIndex);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSliderChange = (value: number[]) => {
    const index = value[0];
    if (index >= 0 && index < timePeriods.length) {
      // Determine direction based on movement
      if (index < lastIndexRef.current) {
        setParticleDirection("past");
      } else if (index > lastIndexRef.current) {
        setParticleDirection("future");
      }
      lastIndexRef.current = index;
      
      // Reset to idle after a short delay
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setParticleDirection("idle"), 300);
      
      onDecadeChange(timePeriods[index]);
    }
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Format label - add "s" for decades
  const formatLabel = (period: string) => {
    return `${period}s`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-4 relative">
      {/* Particles layer */}
      <TimelineParticles direction={particleDirection} intensity={1.2} />
      
      {/* Selected period label */}
      <div className="text-center mb-4">
        <span className="font-display text-2xl font-light text-foreground" key={selectedDecade}>
          {formatLabel(selectedDecade)}
        </span>
      </div>

      {/* Slider */}
      <div className="px-2 relative z-10">
        <Slider
          value={[currentIndex >= 0 ? currentIndex : 0]}
          onValueChange={handleSliderChange}
          max={timePeriods.length - 1}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      {/* Period markers */}
      <div className="flex justify-between mt-2 px-1">
        <span className="font-body text-xs text-muted-foreground">1500</span>
        <span className="font-body text-xs text-muted-foreground">1750</span>
        <span className="font-body text-xs text-muted-foreground">1900</span>
        <span className="font-body text-xs text-muted-foreground">2020</span>
      </div>
    </div>
  );
};

export default DecadeSlider;
