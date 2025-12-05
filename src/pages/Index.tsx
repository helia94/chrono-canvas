import { useState } from "react";
import Header from "@/components/Header";
import DecadeSlider from "@/components/DecadeSlider";
import PaperGlobe from "@/components/PaperGlobe";
import ArtFormSelector from "@/components/ArtFormSelector";
import ArtDisplay from "@/components/ArtDisplay";
import { type TimePeriod, type Region, type ArtForm } from "@/data/mockData";

const Index = () => {
  // Default to 1920s, Western Europe, Visual Arts as specified
  const [selectedDecade, setSelectedDecade] = useState<TimePeriod>("1920");
  const [selectedRegion, setSelectedRegion] = useState<Region>("Western Europe");
  const [selectedArtForm, setSelectedArtForm] = useState<ArtForm>("Visual Arts");

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4">
        <Header />
        
        <section className="mb-2">
          <DecadeSlider
            selectedDecade={selectedDecade}
            onDecadeChange={setSelectedDecade}
          />
        </section>

        <section className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-10">
          <div className="flex-shrink-0">
            <PaperGlobe
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </div>
          
          <div className="flex-1 max-w-md">
            <ArtFormSelector
              selectedArtForm={selectedArtForm}
              onArtFormChange={setSelectedArtForm}
            />
            <ArtDisplay
              decade={selectedDecade}
              region={selectedRegion}
              artForm={selectedArtForm}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;