import { useState, useRef, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface PaperGlobeProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

type SelectionMode = "regions" | "countries";

// Map country names to regions (world-atlas uses NAME property)
type Region =
  | "Western Europe"
  | "Southern Europe & Mediterranean"
  | "Eastern Europe & Balkans"
  | "Russia & Central Asia"
  | "Middle East & North Africa"
  | "Sub-Saharan Africa — West/Central"
  | "Sub-Saharan Africa — East/South"
  | "North America"
  | "Latin America"
  | "East Asia"
  | "South Asia"
  | "Southeast Asia"
  | "Oceania";

// Map country names (world-atlas NAME) to regions
const countryToRegion: Record<string, Region> = {
  // --- Western Europe ---
  "France": "Western Europe",
  "Germany": "Western Europe",
  "United Kingdom": "Western Europe",
  "Netherlands": "Western Europe",
  "Belgium": "Western Europe",
  "Switzerland": "Western Europe",
  "Austria": "Western Europe",
  "Ireland": "Western Europe",
  "Luxembourg": "Western Europe",
  "Denmark": "Western Europe",
  "Sweden": "Western Europe",
  "Norway": "Western Europe",
  "Finland": "Western Europe",
  "Iceland": "Western Europe",
  "Liechtenstein": "Western Europe",
  "Monaco": "Western Europe",
  "Andorra": "Western Europe",

  // --- Southern Europe & Mediterranean ---
  "Italy": "Southern Europe & Mediterranean",
  "Spain": "Southern Europe & Mediterranean",
  "Portugal": "Southern Europe & Mediterranean",
  "Greece": "Southern Europe & Mediterranean",
  "Malta": "Southern Europe & Mediterranean",
  "Cyprus": "Southern Europe & Mediterranean",
  "San Marino": "Southern Europe & Mediterranean",
  "Vatican": "Southern Europe & Mediterranean",

  // --- Eastern Europe & Balkans ---
  "Poland": "Eastern Europe & Balkans",
  "Czechia": "Eastern Europe & Balkans",
  "Slovakia": "Eastern Europe & Balkans",
  "Hungary": "Eastern Europe & Balkans",
  "Romania": "Eastern Europe & Balkans",
  "Bulgaria": "Eastern Europe & Balkans",
  "Serbia": "Eastern Europe & Balkans",
  "Croatia": "Eastern Europe & Balkans",
  "Slovenia": "Eastern Europe & Balkans",
  "Bosnia and Herzegovina": "Eastern Europe & Balkans",
  "North Macedonia": "Eastern Europe & Balkans",
  "Albania": "Eastern Europe & Balkans",
  "Montenegro": "Eastern Europe & Balkans",
  "Moldova": "Eastern Europe & Balkans",
  "Lithuania": "Eastern Europe & Balkans",
  "Latvia": "Eastern Europe & Balkans",
  "Estonia": "Eastern Europe & Balkans",

  // --- Russia & Central Asia ---
  "Russia": "Russia & Central Asia",
  "Belarus": "Russia & Central Asia",
  "Ukraine": "Russia & Central Asia",
  "Georgia": "Russia & Central Asia",
  "Armenia": "Russia & Central Asia",
  "Azerbaijan": "Russia & Central Asia",
  "Kazakhstan": "Russia & Central Asia",
  "Uzbekistan": "Russia & Central Asia",
  "Turkmenistan": "Russia & Central Asia",
  "Kyrgyzstan": "Russia & Central Asia",
  "Tajikistan": "Russia & Central Asia",

  // --- Middle East & North Africa (MENA) ---
  "Morocco": "Middle East & North Africa",
  "Algeria": "Middle East & North Africa",
  "Tunisia": "Middle East & North Africa",
  "Libya": "Middle East & North Africa",
  "Egypt": "Middle East & North Africa",
  "Western Sahara": "Middle East & North Africa",
  "Mauritania": "Middle East & North Africa",

  "Turkey": "Middle East & North Africa",
  "Iran": "Middle East & North Africa",
  "Iraq": "Middle East & North Africa",
  "Syria": "Middle East & North Africa",
  "Jordan": "Middle East & North Africa",
  "Lebanon": "Middle East & North Africa",
  "Israel": "Middle East & North Africa",
  "Palestine": "Middle East & North Africa",

  "Saudi Arabia": "Middle East & North Africa",
  "United Arab Emirates": "Middle East & North Africa",
  "Qatar": "Middle East & North Africa",
  "Bahrain": "Middle East & North Africa",
  "Kuwait": "Middle East & North Africa",
  "Oman": "Middle East & North Africa",
  "Yemen": "Middle East & North Africa",

  // --- Sub-Saharan Africa — West/Central ---
  "Nigeria": "Sub-Saharan Africa — West/Central",
  "Ghana": "Sub-Saharan Africa — West/Central",
  "Senegal": "Sub-Saharan Africa — West/Central",
  "Ivory Coast": "Sub-Saharan Africa — West/Central",
  "Côte d'Ivoire": "Sub-Saharan Africa — West/Central",
  "Togo": "Sub-Saharan Africa — West/Central",
  "Benin": "Sub-Saharan Africa — West/Central",
  "Burkina Faso": "Sub-Saharan Africa — West/Central",
  "Niger": "Sub-Saharan Africa — West/Central",
  "Mali": "Sub-Saharan Africa — West/Central",
  "Guinea": "Sub-Saharan Africa — West/Central",
  "Guinea-Bissau": "Sub-Saharan Africa — West/Central",
  "Sierra Leone": "Sub-Saharan Africa — West/Central",
  "Liberia": "Sub-Saharan Africa — West/Central",
  "Gambia": "Sub-Saharan Africa — West/Central",
  "Cape Verde": "Sub-Saharan Africa — West/Central",
  "Cameroon": "Sub-Saharan Africa — West/Central",
  "Chad": "Sub-Saharan Africa — West/Central",
  "Central African Republic": "Sub-Saharan Africa — West/Central",
  "Gabon": "Sub-Saharan Africa — West/Central",
  "Equatorial Guinea": "Sub-Saharan Africa — West/Central",
  "Republic of the Congo": "Sub-Saharan Africa — West/Central",
  "Democratic Republic of the Congo": "Sub-Saharan Africa — West/Central",
  "Sao Tome and Principe": "Sub-Saharan Africa — West/Central",

  // --- Sub-Saharan Africa — East/South ---
  "Kenya": "Sub-Saharan Africa — East/South",
  "Ethiopia": "Sub-Saharan Africa — East/South",
  "Eritrea": "Sub-Saharan Africa — East/South",
  "Djibouti": "Sub-Saharan Africa — East/South",
  "Somalia": "Sub-Saharan Africa — East/South",
  "South Sudan": "Sub-Saharan Africa — East/South",
  "Sudan": "Sub-Saharan Africa — East/South",
  "Uganda": "Sub-Saharan Africa — East/South",
  "Rwanda": "Sub-Saharan Africa — East/South",
  "Burundi": "Sub-Saharan Africa — East/South",
  "Tanzania": "Sub-Saharan Africa — East/South",
  "Mozambique": "Sub-Saharan Africa — East/South",
  "Zimbabwe": "Sub-Saharan Africa — East/South",
  "Zambia": "Sub-Saharan Africa — East/South",
  "Malawi": "Sub-Saharan Africa — East/South",
  "Angola": "Sub-Saharan Africa — East/South",
  "Namibia": "Sub-Saharan Africa — East/South",
  "Botswana": "Sub-Saharan Africa — East/South",
  "South Africa": "Sub-Saharan Africa — East/South",
  "Lesotho": "Sub-Saharan Africa — East/South",
  "eSwatini": "Sub-Saharan Africa — East/South",
  "Madagascar": "Sub-Saharan Africa — East/South",
  "Mauritius": "Sub-Saharan Africa — East/South",
  "Seychelles": "Sub-Saharan Africa — East/South",
  "Comoros": "Sub-Saharan Africa — East/South",

  // --- North America ---
  "United States of America": "North America",
  "Canada": "North America",
  "Greenland": "North America",

  // --- Latin America ---
  "Mexico": "Latin America",
  "Guatemala": "Latin America",
  "Belize": "Latin America",
  "Honduras": "Latin America",
  "El Salvador": "Latin America",
  "Nicaragua": "Latin America",
  "Costa Rica": "Latin America",
  "Panama": "Latin America",

  "Cuba": "Latin America",
  "Dominican Republic": "Latin America",
  "Haiti": "Latin America",
  "Jamaica": "Latin America",
  "Puerto Rico": "Latin America",
  "Trinidad and Tobago": "Latin America",
  "Barbados": "Latin America",
  "Bahamas": "Latin America",
  "Saint Lucia": "Latin America",
  "Grenada": "Latin America",
  "Saint Vincent and the Grenadines": "Latin America",
  "Saint Kitts and Nevis": "Latin America",
  "Antigua and Barbuda": "Latin America",
  "Dominica": "Latin America",
  "Saint Martin": "Latin America",
  "Saint Barthelemy": "Latin America",

  "Colombia": "Latin America",
  "Venezuela": "Latin America",
  "Guyana": "Latin America",
  "Suriname": "Latin America",
  "Ecuador": "Latin America",
  "Peru": "Latin America",
  "Bolivia": "Latin America",
  "Brazil": "Latin America",
  "Paraguay": "Latin America",
  "Chile": "Latin America",
  "Argentina": "Latin America",
  "Uruguay": "Latin America",

  // --- East Asia ---
  "China": "East Asia",
  "Japan": "East Asia",
  "South Korea": "East Asia",
  "North Korea": "East Asia",
  "Taiwan": "East Asia",
  "Mongolia": "East Asia",

  // --- South Asia ---
  "India": "South Asia",
  "Pakistan": "South Asia",
  "Bangladesh": "South Asia",
  "Nepal": "South Asia",
  "Sri Lanka": "South Asia",
  "Afghanistan": "South Asia",
  "Bhutan": "South Asia",
  "Maldives": "South Asia",

  // --- Southeast Asia ---
  "Vietnam": "Southeast Asia",
  "Thailand": "Southeast Asia",
  "Myanmar": "Southeast Asia",
  "Cambodia": "Southeast Asia",
  "Laos": "Southeast Asia",
  "Malaysia": "Southeast Asia",
  "Singapore": "Southeast Asia",
  "Indonesia": "Southeast Asia",
  "Philippines": "Southeast Asia",
  "Brunei": "Southeast Asia",
  "Timor-Leste": "Southeast Asia",

  // --- Oceania ---
  "Australia": "Oceania",
  "New Zealand": "Oceania",
  "Papua New Guinea": "Oceania",
  "Fiji": "Oceania",
  "Solomon Islands": "Oceania",
  "Vanuatu": "Oceania",
  "Samoa": "Oceania",
  "Tonga": "Oceania",
  "Kiribati": "Oceania",
  "Tuvalu": "Oceania",
  "Nauru": "Oceania",
  "Palau": "Oceania",
  "Micronesia": "Oceania",
  "Marshall Islands": "Oceania",
  "New Caledonia": "Oceania",
  "French Polynesia": "Oceania"
};


const PaperGlobe = ({ selectedRegion, onRegionChange }: PaperGlobeProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("regions");
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
    return "transparent";
  };

  const handleCountryClick = (countryName: string) => {
    // Only handle click if we didn't drag
    if (hasMoved.current) return;
    
    if (selectionMode === "countries") {
      // Send country name directly
      onRegionChange(countryName);
    } else {
      // Send region name (original behavior)
      const region = countryToRegion[countryName];
      if (region) {
        onRegionChange(region);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2">
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

        {/* Mode toggle - subtle button in top left */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectionMode(prev => prev === "regions" ? "countries" : "regions");
          }}
          className="absolute top-2 left-2 z-20 font-body text-[10px] text-muted-foreground/70 hover:text-muted-foreground transition-colors px-1.5 py-0.5 rounded border border-border/30 hover:border-border/50 bg-background/50"
        >
          {selectionMode === "regions" ? "regions" : "countries"}
        </button>

        {/* Drag hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 opacity-50">
          <span className="font-body text-xs text-muted-foreground">
            Drag to rotate • Click to select
          </span>
        </div>
        
        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{
            scale: 140,
            center: [0, 0],
            rotate: [-rotation[0], -rotation[1], 0]
          }}
          width={300}
          height={300}
          style={{ width: "100%", height: "auto" }}
        >
          {/* Subtle graticule lines */}
          <Graticule stroke="hsl(var(--foreground) / 0.08)" strokeWidth={0.4} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const region = countryToRegion[countryName];
                
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
                        stroke: "hsl(var(--foreground))",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "fill 0.3s ease",
                        cursor: region ? "pointer" : "grab"
                      },
                      hover: {
                        fill: region === selectedRegion 
                          ? "hsl(43, 80%, 46%)" 
                          : region 
                            ? "hsl(43, 80%, 46%, 0.4)" 
                            : "hsl(var(--foreground) / 0.05)",
                        stroke: "hsl(var(--foreground))",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: region ? "pointer" : "grab"
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
