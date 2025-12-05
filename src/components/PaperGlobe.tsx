import { useRef, useEffect, useState, useCallback } from "react";
import { type Region } from "@/data/mockData";

// Dynamically import to avoid SSR/initial render issues
let GlobeComponent: any = null;

interface PaperGlobeProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

// Map countries to our regions
const countryToRegion: Record<string, Region> = {
  // Western Europe
  FRA: "Western Europe", DEU: "Western Europe", GBR: "Western Europe", 
  ESP: "Western Europe", ITA: "Western Europe", PRT: "Western Europe",
  NLD: "Western Europe", BEL: "Western Europe", CHE: "Western Europe",
  AUT: "Western Europe", IRL: "Western Europe", LUX: "Western Europe",
  
  // Eastern Europe
  POL: "Eastern Europe", RUS: "Eastern Europe", UKR: "Eastern Europe",
  CZE: "Eastern Europe", HUN: "Eastern Europe", ROU: "Eastern Europe",
  BGR: "Eastern Europe", SRB: "Eastern Europe", HRV: "Eastern Europe",
  SVK: "Eastern Europe", BLR: "Eastern Europe", MDA: "Eastern Europe",
  
  // North America
  USA: "North America", CAN: "North America", MEX: "North America",
  
  // Latin America
  BRA: "Latin America", ARG: "Latin America", COL: "Latin America",
  CHL: "Latin America", PER: "Latin America", VEN: "Latin America",
  ECU: "Latin America", BOL: "Latin America", PRY: "Latin America",
  URY: "Latin America", GUY: "Latin America", SUR: "Latin America",
  CRI: "Latin America", PAN: "Latin America", CUB: "Latin America",
  DOM: "Latin America", GTM: "Latin America", HND: "Latin America",
  NIC: "Latin America", SLV: "Latin America",
  
  // East Asia
  CHN: "East Asia", JPN: "East Asia", KOR: "East Asia",
  PRK: "East Asia", TWN: "East Asia", MNG: "East Asia",
  VNM: "East Asia", THA: "East Asia", MMR: "East Asia",
  KHM: "East Asia", LAO: "East Asia", MYS: "East Asia",
  SGP: "East Asia", IDN: "East Asia", PHL: "East Asia",
  
  // Africa & Middle East
  EGY: "Africa & Middle East", SAU: "Africa & Middle East", IRN: "Africa & Middle East",
  IRQ: "Africa & Middle East", ISR: "Africa & Middle East", TUR: "Africa & Middle East",
  ZAF: "Africa & Middle East", NGA: "Africa & Middle East", KEN: "Africa & Middle East",
  ETH: "Africa & Middle East", GHA: "Africa & Middle East", MAR: "Africa & Middle East",
  DZA: "Africa & Middle East", TUN: "Africa & Middle East", LBY: "Africa & Middle East",
  SDN: "Africa & Middle East", AGO: "Africa & Middle East", MOZ: "Africa & Middle East",
  TZA: "Africa & Middle East", COD: "Africa & Middle East", CMR: "Africa & Middle East",
  CIV: "Africa & Middle East", SEN: "Africa & Middle East", MLI: "Africa & Middle East",
  NER: "Africa & Middle East", TCD: "Africa & Middle East", SOM: "Africa & Middle East",
  UGA: "Africa & Middle East", ZWE: "Africa & Middle East", ZMB: "Africa & Middle East",
  BWA: "Africa & Middle East", NAM: "Africa & Middle East", GAB: "Africa & Middle East",
  ARE: "Africa & Middle East", QAT: "Africa & Middle East", KWT: "Africa & Middle East",
  JOR: "Africa & Middle East", LBN: "Africa & Middle East", SYR: "Africa & Middle East",
  YEM: "Africa & Middle East", OMN: "Africa & Middle East", AFG: "Africa & Middle East",
  PAK: "Africa & Middle East",
};

// Get a representative country for each region (for initial camera position)
const regionCenters: Record<Region, { lat: number; lng: number }> = {
  "Western Europe": { lat: 48.8566, lng: 2.3522 },
  "Eastern Europe": { lat: 52.2297, lng: 21.0122 },
  "North America": { lat: 38.8951, lng: -77.0364 },
  "Latin America": { lat: -15.7801, lng: -47.9292 },
  "East Asia": { lat: 35.6762, lng: 139.6503 },
  "Africa & Middle East": { lat: 30.0444, lng: 31.2357 },
};

const PaperGlobe = ({ selectedRegion, onRegionChange }: PaperGlobeProps) => {
  const globeRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [Globe, setGlobe] = useState<any>(null);

  // Dynamically import Globe component on client side
  useEffect(() => {
    import("react-globe.gl").then((mod) => {
      setGlobe(() => mod.default);
      setIsLoaded(true);
    });
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.features);
      });
  }, []);

  // Set initial globe position after globe is ready
  useEffect(() => {
    if (globeRef.current && isReady) {
      const center = regionCenters[selectedRegion];
      globeRef.current.pointOfView({ lat: center.lat, lng: center.lng, altitude: 2.2 }, 800);
    }
  }, [selectedRegion, isReady]);

  const handleGlobeReady = useCallback(() => {
    setIsReady(true);
    if (globeRef.current) {
      const center = regionCenters[selectedRegion];
      globeRef.current.pointOfView({ lat: center.lat, lng: center.lng, altitude: 2.2 }, 0);
      
      // Disable auto-rotation for cleaner feel
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.minDistance = 180;
        controls.maxDistance = 500;
      }
    }
  }, [selectedRegion]);

  const getRegionFromCountry = useCallback((feature: any): Region | null => {
    const iso = feature?.properties?.id || feature?.properties?.ISO_A3 || feature?.properties?.iso_a3;
    return iso ? countryToRegion[iso] || null : null;
  }, []);

  const getPolygonColor = useCallback((feature: any) => {
    const region = getRegionFromCountry(feature);
    const iso = feature?.properties?.id;
    const isHovered = hovered === iso;
    
    if (region === selectedRegion) {
      return "hsl(43, 80%, 46%)"; // Ochre - selected
    }
    if (isHovered && region) {
      return "hsl(43, 60%, 60%)"; // Lighter ochre - hover
    }
    return "rgba(44, 44, 44, 0.15)"; // Charcoal transparent - default
  }, [selectedRegion, hovered, getRegionFromCountry]);

  const handlePolygonClick = useCallback((polygon: any) => {
    const region = getRegionFromCountry(polygon);
    if (region) {
      onRegionChange(region);
    }
  }, [getRegionFromCountry, onRegionChange]);

  const handlePolygonHover = useCallback((polygon: any) => {
    const iso = polygon?.properties?.id;
    setHovered(iso || null);
    document.body.style.cursor = polygon && getRegionFromCountry(polygon) ? "pointer" : "default";
  }, [getRegionFromCountry]);

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Paper card container */}
      <div 
        ref={containerRef}
        className="paper-card p-4 rounded-sm relative overflow-hidden" 
        style={{ height: "400px" }}
      >
        {/* Subtle spotlight effect */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse at center, hsl(43 80% 46% / 0.08) 0%, transparent 60%)`,
          }}
        />
        
        {(!isLoaded || !isReady || countries.length === 0) && (
          <div className="flex items-center justify-center h-full absolute inset-0 z-20 bg-card">
            <div className="text-center">
              <div className="loading-pulse mx-auto mb-4" />
              <span className="font-body text-sm text-muted-foreground">Loading globe...</span>
            </div>
          </div>
        )}
        
        {isLoaded && Globe && (
          <Globe
            ref={globeRef}
            onGlobeReady={handleGlobeReady}
            width={containerRef.current?.clientWidth || 600}
            height={360}
            backgroundColor="rgba(0,0,0,0)"
            showGlobe={true}
            globeImageUrl=""
            showGraticules={true}
            atmosphereColor="hsl(43, 40%, 70%)"
            atmosphereAltitude={0.15}
            polygonsData={countries}
            polygonStrokeColor={() => "hsl(40, 10%, 35%)"}
            polygonCapColor={getPolygonColor}
            polygonSideColor={() => "rgba(0,0,0,0)"}
            polygonAltitude={(d: any) => {
              const region = getRegionFromCountry(d);
              return region === selectedRegion ? 0.02 : 0.005;
            }}
            onPolygonClick={handlePolygonClick}
            onPolygonHover={handlePolygonHover}
            polygonLabel={(d: any) => {
              const region = getRegionFromCountry(d);
              return region ? `<div class="globe-tooltip">${region}</div>` : "";
            }}
          />
        )}
      </div>
      
      {/* Selected region label */}
      <div className="text-center mt-4">
        <span className="font-display text-primary text-lg tracking-wide animate-fade-in">
          {selectedRegion}
        </span>
      </div>
    </div>
  );
};

export default PaperGlobe;
