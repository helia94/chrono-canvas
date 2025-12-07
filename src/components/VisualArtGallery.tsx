import { useState } from "react";
import { type ArtEntry } from "@/lib/api";

interface VisualArtGalleryProps {
  popular: ArtEntry | null;
  timeless: ArtEntry | null;
  isLoading: boolean;
}

interface ImageCardProps {
  entry: ArtEntry;
  label: string;
}

const ImageCard = ({ entry, label }: ImageCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  if (!entry.image?.url || imageError) {
    return (
      <div className="paper-card p-4 h-full">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
        <div className="w-full h-56 md:h-64 bg-muted/20 rounded flex items-center justify-center border border-dashed border-muted-foreground/20">
          <span className="font-body text-sm text-muted-foreground/50 italic">
            Image not available
          </span>
        </div>
        <p className="font-body text-sm text-foreground mt-3 line-clamp-2">
          {entry.exampleWork}
        </p>
      </div>
    );
  }

  return (
    <a
      href={entry.image.sourceUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="paper-card p-4 h-full transition-shadow hover:shadow-lg">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
        <div className="relative overflow-hidden rounded">
          <img
            src={entry.image.url}
            alt={entry.exampleWork}
            className="w-full h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="font-body text-sm text-foreground mt-3 line-clamp-2">
          {entry.exampleWork}
        </p>
        <p className="font-body text-[10px] text-muted-foreground mt-1">
          Source: The Metropolitan Museum of Art
        </p>
      </div>
    </a>
  );
};

const VisualArtGallery = ({ popular, timeless, isLoading }: VisualArtGalleryProps) => {
  // Check if we have any images to show
  const hasPopularImage = popular?.image?.url;
  const hasTimelessImage = timeless?.image?.url;
  const hasAnyImage = hasPopularImage || hasTimelessImage;

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="paper-card p-4">
            <div className="w-full h-56 md:h-64 bg-muted/30 rounded flex items-center justify-center">
              <div className="loading-pulse" />
            </div>
          </div>
          <div className="paper-card p-4">
            <div className="w-full h-56 md:h-64 bg-muted/30 rounded flex items-center justify-center">
              <div className="loading-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!popular && !timeless) {
    return null;
  }

  // If no images at all, show minimal placeholder
  if (!hasAnyImage) {
    return (
      <div className="w-full py-6">
        <p className="text-center font-body text-sm text-muted-foreground/60 italic">
          No artwork images available for this selection
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {popular && <ImageCard entry={popular} label="Most Popular" />}
        {timeless && <ImageCard entry={timeless} label="Most Timeless" />}
      </div>
    </div>
  );
};

export default VisualArtGallery;
