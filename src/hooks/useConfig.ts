import { useState, useEffect } from "react";
import { fetchConfig, type ConfigResponse } from "@/lib/api";

interface UseConfigReturn {
  config: ConfigResponse | null;
  isLoading: boolean;
  error: Error | null;
}

// Default values for fallback when API is unavailable
const DEFAULT_CONFIG: ConfigResponse = {
  regions: [
    "Western Europe",
    "Eastern Europe",
    "North America",
    "Latin America",
    "East Asia",
    "Africa & Middle East",
  ],
  artForms: ["Visual Arts", "Music", "Literature"],
  timePeriods: [
    "1500", "1550", "1600", "1650", "1700", "1750", "1800", "1850",
    "1900", "1910", "1920", "1930", "1940", "1950",
    "1960", "1970", "1980", "1990", "2000", "2010", "2020"
  ],
};

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const data = await fetchConfig();
        if (isMounted) {
          setConfig(data);
          setError(null);
        }
      } catch (err) {
        console.warn("Failed to fetch config from API, using defaults:", err);
        if (isMounted) {
          // Use defaults as fallback when API is unavailable
          setConfig(DEFAULT_CONFIG);
          setError(err instanceof Error ? err : new Error("Failed to fetch config"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return { config, isLoading, error };
}

