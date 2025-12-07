/**
 * API service for ChronoCanvas backend
 */

// API base URL - configure this based on environment
// Default: Production Railway API, override with VITE_API_URL=http://localhost:8000 for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://chronocanvas-api-production.up.railway.app";

export interface ArtEntry {
  name: string;
  description: string;
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
 * Fetch configuration data (regions, art forms, time periods)
 */
export async function fetchConfig(): Promise<ConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/api/config`);
  if (!response.ok) {
    throw new Error(`Failed to fetch config: ${response.statusText}`);
  }
  return response.json();
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

