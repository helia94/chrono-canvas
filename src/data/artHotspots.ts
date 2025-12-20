// Historical "hot" periods - when art movements peaked in specific regions
// Keep this curated and not too many entries

import { type TimePeriod } from "@/lib/api";

export interface ArtHotspot {
  decade: TimePeriod;
  region: string;
  movement?: string; // Optional label for the movement
}

// Only the most significant moments in art history
export const artHotspots: ArtHotspot[] = [
  // Renaissance
  { decade: "1500", region: "Southern Europe & Mediterranean", movement: "High Renaissance" },
  { decade: "1510", region: "Southern Europe & Mediterranean", movement: "Renaissance" },
  
  // Dutch Golden Age
  { decade: "1630", region: "Western Europe", movement: "Dutch Golden Age" },
  { decade: "1640", region: "Western Europe", movement: "Dutch Golden Age" },
  
  // Baroque
  { decade: "1650", region: "Southern Europe & Mediterranean", movement: "Baroque" },
  
  // Impressionism
  { decade: "1870", region: "Western Europe", movement: "Impressionism" },
  { decade: "1880", region: "Western Europe", movement: "Impressionism" },
  
  // Post-Impressionism / Early Modern
  { decade: "1900", region: "Western Europe", movement: "Post-Impressionism" },
  { decade: "1910", region: "Western Europe", movement: "Cubism" },
  
  // Jazz Age / Harlem Renaissance
  { decade: "1920", region: "North America", movement: "Harlem Renaissance" },
  
  // Abstract Expressionism
  { decade: "1950", region: "North America", movement: "Abstract Expressionism" },
  
  // Pop Art
  { decade: "1960", region: "North America", movement: "Pop Art" },
  { decade: "1960", region: "Western Europe", movement: "Pop Art" },
  
  // Contemporary Asian Art Rise
  { decade: "1990", region: "East Asia", movement: "Contemporary" },
  { decade: "2000", region: "East Asia", movement: "Contemporary" },
];

// Check if a decade-region combination is a hotspot
export const isHotspot = (decade: TimePeriod, region: string): boolean => {
  return artHotspots.some(h => h.decade === decade && h.region === region);
};

// Get hotspot info for a decade-region combination
export const getHotspot = (decade: TimePeriod, region: string): ArtHotspot | undefined => {
  return artHotspots.find(h => h.decade === decade && h.region === region);
};

// Get all hot regions for a given decade
export const getHotRegionsForDecade = (decade: TimePeriod): string[] => {
  return artHotspots.filter(h => h.decade === decade).map(h => h.region);
};
