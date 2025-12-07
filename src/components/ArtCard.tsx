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
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              {isExpanded ? entry.description : entry.description.slice(0, 150)}
              {entry.description.length > 150 && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-primary hover:text-primary/70 transition-colors"
                >
                  ...
                </button>
              )}
              {isExpanded && entry.description.length > 150 && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-primary/60 hover:text-primary/80 ml-1 transition-colors"
                >
                  ←
                </button>
              )}
            </p>
          </div>
          {/* Example work - inline, web-native */}
          <p className="font-body text-xs text-muted-foreground/80 mt-auto pt-2">
            <span className="text-primary/70">{entry.exampleWork}</span>
            {entry.blogUrl && (
              <a
                href={entry.blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-muted-foreground/50 hover:text-primary transition-colors"
              >
                ↗
              </a>
            )}
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
