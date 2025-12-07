import { type ArtEntry } from "@/lib/api";

interface ArtCardProps {
  title: string;
  entry: ArtEntry | null;
  isLoading: boolean;
}

const ArtCard = ({ title, entry, isLoading }: ArtCardProps) => {
  return (
    <div className="paper-card p-4 md:p-5 min-h-[140px] flex flex-col paper-fold-enter">
      {/* Ochre accent line */}
      <div className="w-8 h-0.5 bg-primary mb-3" />
      
      {/* Card title */}
      <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </h3>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-pulse" />
        </div>
      ) : entry ? (
        <div className="flex-1 flex flex-col">
          <h4 className="font-display text-base md:text-lg font-light text-foreground mb-2 leading-snug">
            {entry.name}
          </h4>
          <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-4">
            {entry.description}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body text-xs text-muted-foreground italic">
            No data available
          </p>
        </div>
      )}
    </div>
  );
};

export default ArtCard;
