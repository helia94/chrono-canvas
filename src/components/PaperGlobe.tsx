import { useState, useRef, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule
} from "react-simple-maps";
import { type Region } from "@/data/mockData";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface PaperGlobeProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

// Map ISO country codes to regions
const countryToRegion: Record<string, Region> = {
  // Western Europe
  "FRA": "Western Europe", "DEU": "Western Europe", "GBR": "Western Europe",
  "ITA": "Western Europe", "ESP": "Western Europe", "PRT": "Western Europe",
  "NLD": "Western Europe", "BEL": "Western Europe", "CHE": "Western Europe",
  "AUT": "Western Europe", "IRL": "Western Europe", "LUX": "Western Europe",
  // Eastern Europe
  "POL": "Eastern Europe", "CZE": "Eastern Europe", "HUN": "Eastern Europe",
  "ROU": "Eastern Europe", "BGR": "Eastern Europe", "UKR": "Eastern Europe",
  "RUS": "Eastern Europe", "BLR": "Eastern Europe", "SRB": "Eastern Europe",
  "HRV": "Eastern Europe", "SVK": "Eastern Europe", "SVN": "Eastern Europe",
  // North America
  "USA": "North America", "CAN": "North America", "MEX": "North America",
  // Latin America
  "BRA": "Latin America", "ARG": "Latin America", "CHL": "Latin America",
  "COL": "Latin America", "PER": "Latin America", "VEN": "Latin America",
  "ECU": "Latin America", "BOL": "Latin America", "PRY": "Latin America",
  "URY": "Latin America", "GUY": "Latin America", "SUR": "Latin America",
  "CUB": "Latin America", "DOM": "Latin America", "HTI": "Latin America",
  "JAM": "Latin America", "PAN": "Latin America", "CRI": "Latin America",
  "NIC": "Latin America", "HND": "Latin America", "SLV": "Latin America",
  "GTM": "Latin America", "BLZ": "Latin America",
  // East Asia
  "CHN": "East Asia", "JPN": "East Asia", "KOR": "East Asia",
  "PRK": "East Asia", "TWN": "East Asia", "MNG": "East Asia",
  "VNM": "East Asia", "THA": "East Asia", "MMR": "East Asia",
  "KHM": "East Asia", "LAO": "East Asia", "MYS": "East Asia",
  "SGP": "East Asia", "IDN": "East Asia", "PHL": "East Asia",
  // Africa & Middle East
  "EGY": "Africa & Middle East", "ZAF": "Africa & Middle East", "NGA": "Africa & Middle East",
  "KEN": "Africa & Middle East", "ETH": "Africa & Middle East", "TZA": "Africa & Middle East",
  "MAR": "Africa & Middle East", "DZA": "Africa & Middle East", "TUN": "Africa & Middle East",
  "SAU": "Africa & Middle East", "ARE": "Africa & Middle East", "ISR": "Africa & Middle East",
  "IRN": "Africa & Middle East", "IRQ": "Africa & Middle East", "TUR": "Africa & Middle East",
  "SYR": "Africa & Middle East", "JOR": "Africa & Middle East", "LBN": "Africa & Middle East",
  "GHA": "Africa & Middle East", "SEN": "Africa & Middle East", "CIV": "Africa & Middle East",
  "CMR": "Africa & Middle East", "AGO": "Africa & Middle East", "MOZ": "Africa & Middle East",
  "ZWE": "Africa & Middle East", "UGA": "Africa & Middle East", "SDN": "Africa & Middle East",
  "LBY": "Africa & Middle East", "COD": "Africa & Middle East", "ZMB": "Africa & Middle East",
};

const PaperGlobe = ({ selectedRegion, onRegionChange }: PaperGlobeProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !lastPosition.current) return;
    
    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;
    
    setRotation(prev => [
      prev[0] + deltaX * 0.5,
      Math.max(-60, Math.min(60, prev[1] - deltaY * 0.5))
    ]);
    
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    lastPosition.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    lastPosition.current = null;
  }, []);

  const getCountryFill = (countryCode: string) => {
    const region = countryToRegion[countryCode];
    if (region === selectedRegion) return "hsl(43, 80%, 46%)";
    if (region === hoveredRegion) return "hsl(43, 80%, 46%, 0.3)";
    return "transparent";
  };

  const handleClick = (countryCode: string) => {
    if (isDragging) return;
    const region = countryToRegion[countryCode];
    if (region) {
      onRegionChange(region);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-8">
      <div 
        className="paper-globe-container relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Region label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <span className="font-display text-sm text-primary">
            {selectedRegion}
          </span>
        </div>

        {/* Drag hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 opacity-50">
          <span className="font-body text-xs text-muted-foreground">
            Drag to rotate
          </span>
        </div>
        
        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{
            scale: 180,
            center: [0, 0],
            rotate: [-rotation[0], -rotation[1], 0]
          }}
          width={400}
          height={400}
          style={{ width: "100%", height: "auto", pointerEvents: isDragging ? "none" : "auto" }}
        >
          {/* Subtle graticule lines */}
          <Graticule stroke="hsl(var(--foreground) / 0.08)" strokeWidth={0.4} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = geo.properties.ISO_A3 || geo.id;
                const region = countryToRegion[code];
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleClick(code)}
                    onMouseEnter={() => {
                      if (region && !isDragging) setHoveredRegion(region);
                      document.body.style.cursor = isDragging ? "grabbing" : region ? "pointer" : "grab";
                    }}
                    onMouseLeave={() => {
                      setHoveredRegion(null);
                      document.body.style.cursor = isDragging ? "grabbing" : "grab";
                    }}
                    style={{
                      default: {
                        fill: getCountryFill(code),
                        stroke: "hsl(var(--foreground))",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "fill 0.3s ease"
                      },
                      hover: {
                        fill: region === selectedRegion 
                          ? "hsl(43, 80%, 46%)" 
                          : region 
                            ? "hsl(43, 80%, 46%, 0.4)" 
                            : "hsl(var(--foreground) / 0.05)",
                        stroke: "hsl(var(--foreground))",
                        strokeWidth: 0.5,
                        outline: "none"
                      },
                      pressed: {
                        fill: "hsl(43, 80%, 46%)",
                        stroke: "hsl(var(--foreground))",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
};

export default PaperGlobe;
