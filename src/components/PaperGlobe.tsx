import { useState, useRef, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Sphere
} from "react-simple-maps";
import { type Region } from "@/data/mockData";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface PaperGlobeProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

// Map country names to regions (world-atlas uses NAME property)
const countryToRegion: Record<string, Region> = {
  // Western Europe
  "France": "Western Europe", "Germany": "Western Europe", "United Kingdom": "Western Europe",
  "Italy": "Western Europe", "Spain": "Western Europe", "Portugal": "Western Europe",
  "Netherlands": "Western Europe", "Belgium": "Western Europe", "Switzerland": "Western Europe",
  "Austria": "Western Europe", "Ireland": "Western Europe", "Luxembourg": "Western Europe",
  "Denmark": "Western Europe", "Sweden": "Western Europe", "Norway": "Western Europe",
  "Finland": "Western Europe", "Iceland": "Western Europe", "Greece": "Western Europe",
  // Eastern Europe
  "Poland": "Eastern Europe", "Czechia": "Eastern Europe", "Hungary": "Eastern Europe",
  "Romania": "Eastern Europe", "Bulgaria": "Eastern Europe", "Ukraine": "Eastern Europe",
  "Russia": "Eastern Europe", "Belarus": "Eastern Europe", "Serbia": "Eastern Europe",
  "Croatia": "Eastern Europe", "Slovakia": "Eastern Europe", "Slovenia": "Eastern Europe",
  "Lithuania": "Eastern Europe", "Latvia": "Eastern Europe", "Estonia": "Eastern Europe",
  "Moldova": "Eastern Europe", "Bosnia and Herzegovina": "Eastern Europe",
  "North Macedonia": "Eastern Europe", "Albania": "Eastern Europe", "Montenegro": "Eastern Europe",
  // North America
  "United States of America": "North America", "Canada": "North America", "Mexico": "North America",
  // Latin America
  "Brazil": "Latin America", "Argentina": "Latin America", "Chile": "Latin America",
  "Colombia": "Latin America", "Peru": "Latin America", "Venezuela": "Latin America",
  "Ecuador": "Latin America", "Bolivia": "Latin America", "Paraguay": "Latin America",
  "Uruguay": "Latin America", "Guyana": "Latin America", "Suriname": "Latin America",
  "Cuba": "Latin America", "Dominican Republic": "Latin America", "Haiti": "Latin America",
  "Jamaica": "Latin America", "Panama": "Latin America", "Costa Rica": "Latin America",
  "Nicaragua": "Latin America", "Honduras": "Latin America", "El Salvador": "Latin America",
  "Guatemala": "Latin America", "Belize": "Latin America", "Puerto Rico": "Latin America",
  // East Asia
  "China": "East Asia", "Japan": "East Asia", "South Korea": "East Asia",
  "North Korea": "East Asia", "Taiwan": "East Asia", "Mongolia": "East Asia",
  "Vietnam": "East Asia", "Thailand": "East Asia", "Myanmar": "East Asia",
  "Cambodia": "East Asia", "Laos": "East Asia", "Malaysia": "East Asia",
  "Singapore": "East Asia", "Indonesia": "East Asia", "Philippines": "East Asia",
  "India": "East Asia", "Bangladesh": "East Asia", "Pakistan": "East Asia",
  "Nepal": "East Asia", "Sri Lanka": "East Asia", "Afghanistan": "East Asia",
  "Kazakhstan": "East Asia", "Uzbekistan": "East Asia", "Turkmenistan": "East Asia",
  "Kyrgyzstan": "East Asia", "Tajikistan": "East Asia",
  // Africa & Middle East
  "Egypt": "Africa & Middle East", "South Africa": "Africa & Middle East", "Nigeria": "Africa & Middle East",
  "Kenya": "Africa & Middle East", "Ethiopia": "Africa & Middle East", "Tanzania": "Africa & Middle East",
  "Morocco": "Africa & Middle East", "Algeria": "Africa & Middle East", "Tunisia": "Africa & Middle East",
  "Saudi Arabia": "Africa & Middle East", "United Arab Emirates": "Africa & Middle East", "Israel": "Africa & Middle East",
  "Iran": "Africa & Middle East", "Iraq": "Africa & Middle East", "Turkey": "Africa & Middle East",
  "Syria": "Africa & Middle East", "Jordan": "Africa & Middle East", "Lebanon": "Africa & Middle East",
  "Ghana": "Africa & Middle East", "Senegal": "Africa & Middle East", "Ivory Coast": "Africa & Middle East",
  "Cameroon": "Africa & Middle East", "Angola": "Africa & Middle East", "Mozambique": "Africa & Middle East",
  "Zimbabwe": "Africa & Middle East", "Uganda": "Africa & Middle East", "Sudan": "Africa & Middle East",
  "Libya": "Africa & Middle East", "Democratic Republic of the Congo": "Africa & Middle East", 
  "Zambia": "Africa & Middle East", "Madagascar": "Africa & Middle East", "Mali": "Africa & Middle East",
  "Niger": "Africa & Middle East", "Chad": "Africa & Middle East", "Somalia": "Africa & Middle East",
  "Yemen": "Africa & Middle East", "Oman": "Africa & Middle East", "Kuwait": "Africa & Middle East",
  "Qatar": "Africa & Middle East", "Bahrain": "Africa & Middle East", "Namibia": "Africa & Middle East",
  "Botswana": "Africa & Middle East", "Rwanda": "Africa & Middle East", "Burundi": "Africa & Middle East",
  "Malawi": "Africa & Middle East", "Republic of the Congo": "Africa & Middle East",
  "Central African Republic": "Africa & Middle East", "Gabon": "Africa & Middle East",
  "Equatorial Guinea": "Africa & Middle East", "Eritrea": "Africa & Middle East",
  "Djibouti": "Africa & Middle East", "South Sudan": "Africa & Middle East",
  "Western Sahara": "Africa & Middle East", "Mauritania": "Africa & Middle East",
  "Burkina Faso": "Africa & Middle East", "Togo": "Africa & Middle East", "Benin": "Africa & Middle East",
  "Guinea": "Africa & Middle East", "Guinea-Bissau": "Africa & Middle East", "Sierra Leone": "Africa & Middle East",
  "Liberia": "Africa & Middle East", "Gambia": "Africa & Middle East", "Cape Verde": "Africa & Middle East",
  "Côte d'Ivoire": "Africa & Middle East", "eSwatini": "Africa & Middle East", "Lesotho": "Africa & Middle East",
};

const PaperGlobe = ({ selectedRegion, onRegionChange }: PaperGlobeProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStartPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStartPosition.current) return;
    
    const deltaX = e.clientX - dragStartPosition.current.x;
    const deltaY = e.clientY - dragStartPosition.current.y;
    
    // Only count as dragging if moved more than 3 pixels
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMoved.current = true;
    }
    
    if (hasMoved.current) {
      setRotation(prev => [
        prev[0] + (e.movementX || 0) * 0.5,
        Math.max(-60, Math.min(60, prev[1] - (e.movementY || 0) * 0.5))
      ]);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartPosition.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    dragStartPosition.current = null;
  }, []);

  const getCountryFill = (countryName: string) => {
    const region = countryToRegion[countryName];
    if (region === selectedRegion) return "hsl(43, 80%, 46%)";
    if (region === hoveredRegion) return "hsl(43, 80%, 46%, 0.3)";
    return "hsl(43, 80%, 46%)"; // All land is ochre
  };

  const handleCountryClick = (countryName: string) => {
    // Only handle click if we didn't drag
    if (hasMoved.current) return;
    
    const region = countryToRegion[countryName];
    if (region) {
      onRegionChange(region);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-2">
      <div 
        className="globe-frame relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{
            scale: 130,
            center: [0, 0],
            rotate: [-rotation[0], -rotation[1], 0]
          }}
          width={280}
          height={280}
          style={{ width: "100%", height: "auto" }}
        >
          {/* Sphere background */}
          <Sphere 
            id="sphere" 
            fill="hsl(40, 33%, 90%)" 
            stroke="hsl(0, 0%, 17%)" 
            strokeWidth={0.5}
          />
          
          {/* Graticule lines */}
          <Graticule stroke="hsl(0, 0%, 17%, 0.15)" strokeWidth={0.3} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const region = countryToRegion[countryName];
                const isSelected = region === selectedRegion;
                const isHovered = region === hoveredRegion;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(countryName)}
                    onMouseEnter={() => {
                      if (region && !hasMoved.current) setHoveredRegion(region);
                    }}
                    onMouseLeave={() => {
                      setHoveredRegion(null);
                    }}
                    style={{
                      default: {
                        fill: getCountryFill(countryName),
                        stroke: "hsl(0, 0%, 17%)",
                        strokeWidth: isSelected ? 1 : 0.3,
                        outline: "none",
                        transition: "stroke-width 0.3s ease",
                        cursor: region ? "pointer" : "grab",
                        opacity: isSelected ? 1 : 0.7
                      },
                      hover: {
                        fill: "hsl(43, 80%, 46%)",
                        stroke: "hsl(0, 0%, 17%)",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: region ? "pointer" : "grab",
                        opacity: 1
                      },
                      pressed: {
                        fill: "hsl(43, 80%, 46%)",
                        stroke: "hsl(0, 0%, 17%)",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Region label at bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="font-display text-base text-primary">
            {selectedRegion}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaperGlobe;