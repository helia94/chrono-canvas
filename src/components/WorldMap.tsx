import { type Region } from "@/data/mockData";

interface WorldMapProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

const WorldMap = ({ selectedRegion, onRegionChange }: WorldMapProps) => {
  // Simplified, abstract landmass shapes for each region
  const regionPaths: Record<Region, { d: string; labelPos: { x: number; y: number } }> = {
    "Western Europe": {
      d: "M240 80 L260 75 L275 85 L280 100 L275 120 L265 135 L250 140 L235 130 L230 110 L235 90 Z",
      labelPos: { x: 255, y: 155 }
    },
    "Eastern Europe": {
      d: "M280 70 L320 65 L340 85 L345 110 L335 135 L310 145 L285 135 L275 115 L280 90 Z",
      labelPos: { x: 310, y: 155 }
    },
    "North America": {
      d: "M60 60 L130 50 L160 70 L165 100 L150 140 L110 160 L70 150 L50 120 L45 85 Z",
      labelPos: { x: 105, y: 175 }
    },
    "Latin America": {
      d: "M100 170 L130 165 L145 185 L140 220 L125 260 L105 280 L85 270 L80 235 L90 195 Z",
      labelPos: { x: 112, y: 295 }
    },
    "East Asia": {
      d: "M380 80 L430 75 L455 95 L460 125 L445 155 L410 165 L375 150 L365 120 L370 95 Z",
      labelPos: { x: 415, y: 180 }
    },
    "Africa & Middle East": {
      d: "M270 160 L320 155 L345 175 L350 215 L335 265 L300 280 L265 265 L255 220 L260 180 Z",
      labelPos: { x: 305, y: 295 }
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-8">
      <svg
        viewBox="0 0 500 340"
        className="w-full h-auto"
        role="img"
        aria-label="World map region selector"
      >
        {/* Background subtle grid pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-foreground/5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Region shapes */}
        {(Object.entries(regionPaths) as [Region, typeof regionPaths[Region]][]).map(
          ([region, { d, labelPos }]) => (
            <g key={region}>
              {/* Spotlight glow effect for selected region */}
              {selectedRegion === region && (
                <ellipse
                  cx={labelPos.x}
                  cy={labelPos.y - 60}
                  rx="60"
                  ry="50"
                  fill="hsl(var(--primary))"
                  opacity="0.1"
                  className="animate-pulse"
                />
              )}
              
              <path
                d={d}
                className={`region-path ${selectedRegion === region ? "selected" : ""}`}
                onClick={() => onRegionChange(region)}
                role="button"
                aria-label={`Select ${region}`}
                aria-pressed={selectedRegion === region}
              />
              
              {/* Region label - only show on selection */}
              {selectedRegion === region && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  className="font-display text-xs fill-primary pointer-events-none animate-fade-in"
                  style={{ fontSize: '10px' }}
                >
                  {region}
                </text>
              )}
            </g>
          )
        )}
      </svg>
    </div>
  );
};

export default WorldMap;
