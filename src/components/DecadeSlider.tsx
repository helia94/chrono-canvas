import { type TimePeriod } from "@/lib/api";
import { Slider } from "@/components/ui/slider";

interface DecadeSliderProps {
  timePeriods: TimePeriod[];
  selectedDecade: TimePeriod;
  onDecadeChange: (decade: TimePeriod) => void;
}

const DecadeSlider = ({ timePeriods, selectedDecade, onDecadeChange }: DecadeSliderProps) => {
  const currentIndex = timePeriods.indexOf(selectedDecade);
  
  const handleSliderChange = (value: number[]) => {
    const index = value[0];
    if (index >= 0 && index < timePeriods.length) {
      onDecadeChange(timePeriods[index]);
    }
  };

  // Format label - add "s" for decades
  const formatLabel = (period: string) => {
    return `${period}s`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-4">
      {/* Selected period label */}
      <div className="text-center mb-4">
        <span className="font-display text-2xl font-light text-foreground" key={selectedDecade}>
          {formatLabel(selectedDecade)}
        </span>
      </div>

      {/* Slider */}
      <div className="px-2">
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
