import { type ArtEntry } from "@/data/mockData";

interface ArtCardProps {
  title: string;
  entry: ArtEntry | null;
  isLoading: boolean;
}

const ArtCard = ({ title, entry, isLoading }: ArtCardProps) => {
  return (
    <div className="paper-card p-8 md:p-10 min-h-[280px] flex flex-col paper-fold-enter">
      {/* Ochre accent line */}
      <div className="w-12 h-0.5 bg-primary mb-6" />
      
      {/* Card title */}
      <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-6">
        {title}
      </h3>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="loading-pulse" />
        </div>
      ) : entry ? (
        <div className="flex-1 flex flex-col">
          <h4 className="font-display text-xl md:text-2xl font-light text-foreground mb-4 leading-relaxed">
            {entry.name}
          </h4>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {entry.description}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body text-sm text-muted-foreground italic">
            No data available for this combination
          </p>
        </div>
      )}
    </div>
  );
};

export default ArtCard;
