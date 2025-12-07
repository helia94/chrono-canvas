import { useState, useEffect } from "react";
import { fetchArtData, toBackendRegion, type ArtData, type Region, type ArtForm, type TimePeriod } from "@/lib/api";
import ArtCard from "./ArtCard";

interface ArtDisplayProps {
  decade: TimePeriod;
  region: Region;
  artForm: ArtForm;
}

const ArtDisplay = ({ decade, region, artForm }: ArtDisplayProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [artData, setArtData] = useState<ArtData | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    
    const loadData = async () => {
      try {
        // Map detailed frontend region to backend region
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
          setIsLoading(false);
        }
      }
    };

    // Add small delay for smoother transition
    const timer = setTimeout(loadData, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [decade, region, artForm]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
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
