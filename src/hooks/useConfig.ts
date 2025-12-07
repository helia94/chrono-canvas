import { type ConfigResponse } from "@/lib/api";

interface UseConfigReturn {
  config: ConfigResponse;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Frontend is the source of truth for available regions, art forms, and time periods.
 * The backend accepts any values and caches the results.
 */
const CONFIG: ConfigResponse = {
  // These are the backend-compatible region names (used for API calls)
  // The PaperGlobe uses more detailed regions which are mapped to these in api.ts
  regions: [
    "Western Europe",
    "Eastern Europe",
    "North America",
    "Latin America",
    "East Asia",
    "Middle East",
    "Africa",
  ],
  artForms: ["Visual Arts", "Music", "Literature"],
  timePeriods: [
    "1500", "1550", "1600", "1650", "1700", "1750", "1800", "1850",
    "1900", "1910", "1920", "1930", "1940", "1950",
    "1960", "1970", "1980", "1990", "2000", "2010", "2020"
  ],
};

export function useConfig(): UseConfigReturn {
  // Config is now static - frontend is source of truth
  return {
    config: CONFIG,
    isLoading: false,
    error: null,
  };
}

