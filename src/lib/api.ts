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

export interface YouTubeVideo {
  videoId: string;
  title: string;
  url: string;
  embedUrl: string;
  recordSales?: string | null;
}

export interface ArtEntry {
  genre: string;
  artists: string;
  exampleWork: string;
  description: string;
  image?: ArtImage | null;
  youtube?: YouTubeVideo | null;
  blogUrl?: string | null;
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
  "Middle East": "Middle East",
  "Africa": "Africa",
  
  // Europe mappings
  "Southern Europe & Mediterranean": "Western Europe",
  "Eastern Europe & Balkans": "Eastern Europe",
  "Russia & Central Asia": "Eastern Europe",
  
  // Middle East mappings (from PaperGlobe)
  "Middle East & North Africa": "Middle East",
  
  // Africa mappings (from PaperGlobe)
  "Sub-Saharan Africa — West/Central": "Africa",
  "Sub-Saharan Africa — East/South": "Africa",
  
  // Asia mappings
  "South Asia": "East Asia",
  "Southeast Asia": "East Asia",
  
  // Oceania mapping
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

/**
 * Emotion Explorer types
 */
export interface EmotionWord {
  name: string;
  language: string;
  meaning: string;
  cultural_context: string;
}

export interface EmotionResponse {
  intro: string;
  emotions: EmotionWord[];
}

/**
 * Resolve an emotion into nuanced cross-cultural variants
 */
export async function resolveEmotion(emotion: string): Promise<EmotionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/emotion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emotion }),
  });
  if (!response.ok) {
    throw new Error(`Failed to resolve emotion: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Feedback types
 */
export type FeedbackType = "like" | "dislike";

export interface FeedbackCounts {
  likes: number;
  dislikes: number;
}

/**
 * Fetch feedback counts for a specific configuration
 */
export async function fetchFeedbackCounts(
  decade: string,
  region: string,
  artForm: string
): Promise<FeedbackCounts> {
  const params = new URLSearchParams({ decade, region, artForm });
  const response = await fetch(`${API_BASE_URL}/api/feedback?${params}`);
  if (!response.ok) {
    return { likes: 0, dislikes: 0 };
  }
  return response.json();
}

/**
 * Submit anonymous feedback for a specific configuration
 * Returns updated counts
 */
export async function submitFeedback(
  decade: string,
  region: string,
  artForm: string,
  feedback: FeedbackType
): Promise<FeedbackCounts> {
  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decade, region, artForm, feedback }),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit feedback: ${response.statusText}`);
  }
  const data = await response.json();
  return { likes: data.likes || 0, dislikes: data.dislikes || 0 };
}
