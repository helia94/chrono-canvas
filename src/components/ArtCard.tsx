import { type ArtEntry } from "@/data/mockData";

interface ArtCardProps {
  title: string;
  entry: ArtEntry | null;
  isLoading: boolean;
}

const ArtCard = ({ title, entry, isLoading }: ArtCardProps) => {
  return (
    <div className="py-3">
      {/* Card title */}
      <h3 className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {title}
      </h3>

      {isLoading ? (
        <div className="h-20 flex items-center">
          <div className="loading-pulse" />
        </div>
      ) : entry ? (
        <div>
          <h4 className="font-display text-xl font-light text-foreground mb-2 leading-snug">
            {entry.name}
          </h4>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {entry.description}
          </p>
        </div>
      ) : (
        <p className="font-body text-sm text-muted-foreground italic">
          No data available
        </p>
      )}
    </div>
  );
};

export default ArtCard;