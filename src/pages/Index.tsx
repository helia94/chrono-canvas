import { useState } from "react";
import Header from "@/components/Header";
import DecadeSlider from "@/components/DecadeSlider";
import PaperGlobe from "@/components/PaperGlobe";
import ArtFormSelector from "@/components/ArtFormSelector";
import ArtDisplay from "@/components/ArtDisplay";
import VisualArtGallery from "@/components/VisualArtGallery";
import { useConfig } from "@/hooks/useConfig";
import { useArtData } from "@/hooks/useArtData";
import { type TimePeriod, type Region, type ArtForm } from "@/lib/api";

const Index = () => {
  const { config, isLoading: configLoading } = useConfig();
  
  // Default to 1920s, Western Europe, Visual Arts as specified
  const [selectedDecade, setSelectedDecade] = useState<TimePeriod>("1920");
  const [selectedRegion, setSelectedRegion] = useState<Region>("Western Europe");
  const [selectedArtForm, setSelectedArtForm] = useState<ArtForm>("Visual Arts");

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
        <Header />
        
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
            />
          </div>
          
          <ArtDisplay
            artData={artData}
            isLoading={isLoading}
            showLoadingHint={showLoadingHint}
          />
        </section>

        {/* Row 2: Image Gallery (Visual Arts only) */}
        {isVisualArts && (
          <section>
            <VisualArtGallery
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

export default Index;
