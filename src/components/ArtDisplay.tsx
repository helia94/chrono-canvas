import { useState, useEffect } from "react";
import { getDefaultOrArtData, type Decade, type Region, type ArtForm, type ArtData } from "@/data/mockData";
import ArtCard from "./ArtCard";

interface ArtDisplayProps {
  decade: Decade;
  region: Region;
  artForm: ArtForm;
}

const ArtDisplay = ({ decade, region, artForm }: ArtDisplayProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [artData, setArtData] = useState<ArtData | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading delay for smooth transition
    const timer = setTimeout(() => {
      const data = getDefaultOrArtData(decade, region, artForm);
      setArtData(data);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
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
