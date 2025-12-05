import { useState } from "react";
import Header from "@/components/Header";
import DecadeSlider from "@/components/DecadeSlider";
import PaperGlobe from "@/components/PaperGlobe";
import ArtFormSelector from "@/components/ArtFormSelector";
import ArtDisplay from "@/components/ArtDisplay";
import { type Decade, type Region, type ArtForm } from "@/data/mockData";

const Index = () => {
  // Default to 1920s, Western Europe, Visual Arts as specified
  const [selectedDecade, setSelectedDecade] = useState<Decade>("1920");
  const [selectedRegion, setSelectedRegion] = useState<Region>("Western Europe");
  const [selectedArtForm, setSelectedArtForm] = useState<ArtForm>("Visual Arts");

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto">
        <Header />
        
        <section className="mb-8">
          <DecadeSlider
            selectedDecade={selectedDecade}
            onDecadeChange={setSelectedDecade}
          />
        </section>

        <section className="mb-4">
          <PaperGlobe
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />
        </section>

        <section className="mb-8">
          <ArtFormSelector
            selectedArtForm={selectedArtForm}
            onArtFormChange={setSelectedArtForm}
          />
        </section>

        <section className="pb-20">
          <ArtDisplay
            decade={selectedDecade}
            region={selectedRegion}
            artForm={selectedArtForm}
          />
        </section>
      </main>
    </div>
  );
};

export default Index;
