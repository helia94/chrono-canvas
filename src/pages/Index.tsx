import { useState } from "react";
import Header from "@/components/Header";
import DecadeSlider from "@/components/DecadeSlider";
import PaperGlobe from "@/components/PaperGlobe";
import ArtFormSelector from "@/components/ArtFormSelector";
import ArtDisplay from "@/components/ArtDisplay";
import { useConfig } from "@/hooks/useConfig";
import { type TimePeriod, type Region, type ArtForm } from "@/lib/api";

const Index = () => {
  const { config, isLoading: configLoading } = useConfig();
  
  // Default to 1920s, Western Europe, Visual Arts as specified
  const [selectedDecade, setSelectedDecade] = useState<TimePeriod>("1920");
  const [selectedRegion, setSelectedRegion] = useState<Region>("Western Europe");
  const [selectedArtForm, setSelectedArtForm] = useState<ArtForm>("Visual Arts");

  // Use config values or defaults
  const timePeriods = config?.timePeriods ?? [];
  const artForms = config?.artForms ?? [];

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
        
        <section>
          <DecadeSlider
            timePeriods={timePeriods}
            selectedDecade={selectedDecade}
            onDecadeChange={setSelectedDecade}
          />
        </section>

        <section className="flex flex-col lg:flex-row items-center justify-center gap-4">
          <div className="flex-shrink-0">
            <PaperGlobe
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </div>
          
          <div className="flex-1 max-w-xl">
            <ArtFormSelector
              artForms={artForms}
              selectedArtForm={selectedArtForm}
              onArtFormChange={setSelectedArtForm}
            />
            <ArtDisplay
              decade={selectedDecade}
              region={selectedRegion}
              artForm={selectedArtForm}
              showImages={true}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
