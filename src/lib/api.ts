/**
 * API service for ChronoCanvas backend
 */

// API base URL - configure this based on environment
// Default: Production Railway API, override with VITE_API_URL=http://localhost:8000 for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://chronocanvas-api-production.up.railway.app";

export interface ArtImage {
  url: string;
  sourceUrl?: string;
}

export interface SpotifyTrack {
  trackId: string;
  name: string;
  artist: string;
  album: string;
  previewUrl?: string | null;
  embedUrl: string;
  externalUrl: string;
  albumImageUrl?: string | null;
}

export interface ArtEntry {
  genre: string;
  artists: string;
  exampleWork: string;
  description: string;
  image?: ArtImage | null;
  spotify?: SpotifyTrack | null;
}

export interface ArtData {
  decade: string;
  region: string;
  artForm: string;
  popular: ArtEntry;
  timeless: ArtEntry;
}

export interface ConfigResponse {
  regions: string[];
  artForms: string[];
  timePeriods: string[];
}

export interface ArtDataResponse {
  data: ArtData | null;
  found: boolean;
}

export type Region = string;
export type ArtForm = string;
export type TimePeriod = string;
export type Decade = TimePeriod; // Alias for backwards compatibility

/**
 * Map detailed frontend regions to backend regions
 * The frontend (PaperGlobe) uses more granular regions than the backend supports
 */
const regionToBackendRegion: Record<string, string> = {
  // Direct matches
  "Western Europe": "Western Europe",
  "North America": "North America",
  "Latin America": "Latin America",
  "East Asia": "East Asia",
  
  // Europe mappings
  "Southern Europe & Mediterranean": "Western Europe",
  "Eastern Europe & Balkans": "Eastern Europe",
  "Russia & Central Asia": "Eastern Europe",
  
  // Africa & Middle East mappings
  "Middle East & North Africa": "Africa & Middle East",
  "Sub-Saharan Africa — West/Central": "Africa & Middle East",
  "Sub-Saharan Africa — East/South": "Africa & Middle East",
  
  // Asia mappings
  "South Asia": "East Asia",
  "Southeast Asia": "East Asia",
  
  // Oceania mapping (closest culturally to Western heritage for art history)
  "Oceania": "East Asia",
};

/**
 * Convert frontend region to backend region
 */
export function toBackendRegion(frontendRegion: string): string {
  return regionToBackendRegion[frontendRegion] || frontendRegion;
}

/**
 * Fetch art data for a specific decade, region, and art form
 */
export async function fetchArtData(
  decade: string,
  region: string,
  artForm: string
): Promise<ArtDataResponse> {
  const params = new URLSearchParams({ decade, region, artForm });
  const response = await fetch(`${API_BASE_URL}/api/art?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch art data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch art data for exact match only (no fallback)
 */
export async function fetchArtDataExact(
  decade: string,
  region: string,
  artForm: string
): Promise<ArtDataResponse> {
  const params = new URLSearchParams({ decade, region, artForm });
  const response = await fetch(`${API_BASE_URL}/api/art/exact?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch art data: ${response.statusText}`);
  }
  return response.json();
}

