import { decades, type Decade } from "@/data/mockData";

interface DecadeSliderProps {
  selectedDecade: Decade;
  onDecadeChange: (decade: Decade) => void;
}

const DecadeSlider = ({ selectedDecade, onDecadeChange }: DecadeSliderProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-12">
      {/* Selected decade label */}
      <div className="text-center mb-8 h-12">
        <span className="font-display text-3xl md:text-4xl font-light text-foreground animate-fade-in" key={selectedDecade}>
          {selectedDecade}s
        </span>
      </div>

      {/* Timeline track */}
      <div className="relative">
        {/* Base line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground/20 -translate-y-1/2" />

        {/* Decade markers */}
        <div className="relative flex justify-between items-center">
          {decades.map((decade) => (
            <button
              key={decade}
              onClick={() => onDecadeChange(decade)}
              className="relative flex flex-col items-center group z-10"
              aria-label={`Select ${decade}s`}
            >
              <div
                className={`decade-marker ${
                  selectedDecade === decade ? "selected" : ""
                } group-hover:scale-125`}
              />
              <span
                className={`mt-3 font-body text-xs transition-all duration-300 ${
                  selectedDecade === decade
                    ? "text-primary font-medium"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100"
                }`}
              >
                {decade}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecadeSlider;
