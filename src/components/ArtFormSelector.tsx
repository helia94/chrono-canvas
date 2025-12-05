import { artForms, type ArtForm } from "@/data/mockData";

interface ArtFormSelectorProps {
  selectedArtForm: ArtForm;
  onArtFormChange: (artForm: ArtForm) => void;
}

const ArtFormSelector = ({ selectedArtForm, onArtFormChange }: ArtFormSelectorProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-2">
      {artForms.map((artForm) => (
        <button
          key={artForm}
          onClick={() => onArtFormChange(artForm)}
          className={`art-form-btn ${selectedArtForm === artForm ? "selected" : ""}`}
          aria-pressed={selectedArtForm === artForm}
        >
          {artForm}
        </button>
      ))}
    </div>
  );
};

export default ArtFormSelector;
