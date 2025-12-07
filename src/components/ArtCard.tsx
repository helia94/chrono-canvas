import { useState } from "react";
import { type ArtEntry } from "@/lib/api";

interface ArtCardProps {
  title: string;
  entry: ArtEntry | null;
  isLoading: boolean;
}

const ArtCard = ({ title, entry, isLoading }: ArtCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          {/* Genre as main title */}
          <h4 className="font-display text-base md:text-lg font-light text-foreground mb-1 leading-snug">
            {entry.genre}
          </h4>
          {/* Artists */}
          <p className="font-body text-xs text-primary mb-2">
            {entry.artists}
          </p>
          {/* Description with expand/collapse */}
          <div className="relative">
            <p className={`font-body text-xs text-muted-foreground leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
              {entry.description}
            </p>
            {entry.description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-body text-xs text-primary hover:text-primary/80 mt-1 underline underline-offset-2"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
          {/* Example work */}
          <p className="font-body text-[10px] text-muted-foreground/70 mt-2 italic">
            Notable: {entry.exampleWork}
          </p>
          {/* Blog link if available */}
          {entry.blogUrl && (
            <a
              href={entry.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[10px] text-primary hover:text-primary/80 mt-1 underline underline-offset-2"
            >
              📖 Read a personal perspective →
            </a>
          )}
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
