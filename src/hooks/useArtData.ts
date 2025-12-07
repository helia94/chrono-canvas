import { useState, useEffect, useRef } from "react";
import { fetchArtData, toBackendRegion, type ArtData, type Region, type ArtForm, type TimePeriod } from "@/lib/api";

interface UseArtDataReturn {
  artData: ArtData | null;
  isLoading: boolean;
  showLoadingHint: boolean;
}

export function useArtData(decade: TimePeriod, region: Region, artForm: ArtForm): UseArtDataReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [artData, setArtData] = useState<ArtData | null>(null);
  const [showLoadingHint, setShowLoadingHint] = useState(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    setShowLoadingHint(false);
    
    // Show hint after 500ms if still loading
    const hintTimer = setTimeout(() => {
      if (!isCancelled && isLoadingRef.current) {
        setShowLoadingHint(true);
      }
    }, 500);

    const loadData = async () => {
      try {
        const backendRegion = toBackendRegion(region);
        const response = await fetchArtData(decade, backendRegion, artForm);
        if (!isCancelled) {
          setArtData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch art data:", error);
        if (!isCancelled) {
          setArtData(null);
        }
      } finally {
        if (!isCancelled) {
          isLoadingRef.current = false;
          setIsLoading(false);
          setShowLoadingHint(false);
        }
      }
    };

    const timer = setTimeout(loadData, 300);

    return () => {
      isCancelled = true;
      isLoadingRef.current = false;
      clearTimeout(timer);
      clearTimeout(hintTimer);
    };
  }, [decade, region, artForm]);

  return { artData, isLoading, showLoadingHint };
}
