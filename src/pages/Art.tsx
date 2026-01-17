import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import DecadeSlider from "@/components/DecadeSlider";
import PaperGlobe from "@/components/PaperGlobe";
import ArtFormSelector from "@/components/ArtFormSelector";
import ArtDisplay from "@/components/ArtDisplay";
import VisualArtGallery from "@/components/VisualArtGallery";
import MusicPlayer from "@/components/MusicPlayer";
import ShareAndFeedback from "@/components/ShareAndFeedback";
import { useConfig } from "@/hooks/useConfig";
import { useArtData } from "@/hooks/useArtData";
import { type TimePeriod, type Region, type ArtForm } from "@/lib/api";
import { getHotRegionsForDecade } from "@/data/artHotspots";
import { ArrowLeft } from "lucide-react";

// Parse URL params for initial state
function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  return {
    decade: (params.get("decade") as TimePeriod) || "1920",
    region: (params.get("region") as Region) || "Western Europe",
    artForm: (params.get("artForm") as ArtForm) || "Visual Arts",
  };
}

const Art = () => {
  const { config, isLoading: configLoading } = useConfig();
  
  // Initialize from URL params, then stay static
  const initial = getInitialState();
  const [selectedDecade, setSelectedDecade] = useState<TimePeriod>(initial.decade);
  const [selectedRegion, setSelectedRegion] = useState<Region>(initial.region);
  const [selectedArtForm, setSelectedArtForm] = useState<ArtForm>(initial.artForm);

  // Clear URL params after reading (keep URL clean during use)
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Fetch art data using shared hook
  const { artData, isLoading, showLoadingHint } = useArtData(
    selectedDecade,
    selectedRegion,
    selectedArtForm
  );

  // Use config values or defaults
  const timePeriods = config?.timePeriods ?? [];
  const artForms = config?.artForms ?? [];

  const isVisualArts = selectedArtForm === "Visual Arts";
  const isMusic = selectedArtForm === "Music";

  if (configLoading && !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="pt-6 pl-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Header />
          </div>
          <div className="pt-6 pr-4">
            <ShareAndFeedback
              decade={selectedDecade}
              region={selectedRegion}
              artForm={selectedArtForm}
            />
          </div>
        </div>
        
        {/* Decade slider */}
        <section>
          <DecadeSlider
            timePeriods={timePeriods}
            selectedDecade={selectedDecade}
            onDecadeChange={setSelectedDecade}
          />
        </section>

        {/* Art form selector */}
        <section className="mb-4">
          <ArtFormSelector
            artForms={artForms}
            selectedArtForm={selectedArtForm}
            onArtFormChange={setSelectedArtForm}
          />
        </section>

        {/* Row 1: Globe + Text Cards */}
        <section className="flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6 mb-6">
          <div className="flex-shrink-0 self-center lg:self-start">
            <PaperGlobe
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              hotRegions={getHotRegionsForDecade(selectedDecade)}
            />
          </div>
          
          <ArtDisplay
            artData={artData}
            isLoading={isLoading}
            showLoadingHint={showLoadingHint}
          />
        </section>

        {/* Row 2: Media Gallery */}
        {isVisualArts && (
          <section>
            <VisualArtGallery
              popular={artData?.popular || null}
              timeless={artData?.timeless || null}
              isLoading={isLoading}
            />
          </section>
        )}
        
        {isMusic && (
          <section>
            <MusicPlayer
              popular={artData?.popular || null}
              timeless={artData?.timeless || null}
              isLoading={isLoading}
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default Art;
