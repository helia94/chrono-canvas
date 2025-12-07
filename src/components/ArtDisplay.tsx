import { type ArtData } from "@/lib/api";
import ArtCard from "./ArtCard";
import LoadingIndicator from "./LoadingIndicator";

interface ArtDisplayProps {
  artData: ArtData | null;
  isLoading: boolean;
  showLoadingHint: boolean;
}

const ArtDisplay = ({ artData, isLoading, showLoadingHint }: ArtDisplayProps) => {
  return (
    <div className="flex-1 relative">
      {/* Overlay indicator - doesn't affect layout */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <LoadingIndicator isVisible={showLoadingHint} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
