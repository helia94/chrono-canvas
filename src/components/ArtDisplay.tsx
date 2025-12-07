import { useState, useEffect, useRef } from "react";
import { fetchArtData, toBackendRegion, type ArtData, type Region, type ArtForm, type TimePeriod } from "@/lib/api";
import ArtCard from "./ArtCard";
import LoadingIndicator from "./LoadingIndicator";

interface ArtDisplayProps {
  decade: TimePeriod;
  region: Region;
  artForm: ArtForm;
}

const ArtDisplay = ({ decade, region, artForm }: ArtDisplayProps) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 relative">
      {/* Overlay indicator - doesn't affect layout */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <LoadingIndicator isVisible={showLoadingHint} />
      </div>
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <ArtCard
          title="Most Popular of the Decade"
          entry={artData?.popular || null}
          isLoading={isLoading}
        />
        <ArtCard
          title="Most Timeless"
          entry={artData?.timeless || null}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ArtDisplay;
