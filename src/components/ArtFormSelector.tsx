import { artForms, type ArtForm } from "@/data/mockData";

interface ArtFormSelectorProps {
  selectedArtForm: ArtForm;
  onArtFormChange: (artForm: ArtForm) => void;
}

const ArtFormSelector = ({ selectedArtForm, onArtFormChange }: ArtFormSelectorProps) => {
  return (
    <div className="flex justify-center gap-8 py-3">
      {artForms.map((artForm) => (
        <button
          key={artForm}
          onClick={() => onArtFormChange(artForm)}
          className={`font-display text-base transition-all duration-300 ${
            selectedArtForm === artForm 
              ? "text-foreground underline underline-offset-4 decoration-primary" 
              : "text-foreground/60 hover:text-foreground"
          }`}
          aria-pressed={selectedArtForm === artForm}
        >
          {artForm}
        </button>
      ))}
    </div>
  );
};

export default ArtFormSelector;