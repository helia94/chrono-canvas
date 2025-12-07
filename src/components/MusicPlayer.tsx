import { type ArtEntry } from "@/lib/api";

interface MusicPlayerProps {
  popular: ArtEntry | null;
  timeless: ArtEntry | null;
  isLoading: boolean;
}

interface YouTubeCardProps {
  entry: ArtEntry;
  label: string;
}

const YouTubeCard = ({ entry, label }: YouTubeCardProps) => {
  const youtube = entry.youtube;
  
  if (!youtube) {
    return (
      <div className="paper-card p-4 h-full">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
        <div className="w-full h-20 bg-muted/20 rounded flex items-center justify-center border border-dashed border-muted-foreground/20">
          <span className="font-body text-sm text-muted-foreground/50 italic">
            Video not available
          </span>
        </div>
        <p className="font-body text-sm text-foreground mt-3 line-clamp-2">
          {entry.exampleWork}
        </p>
      </div>
    );
  }

  return (
    <div className="paper-card p-4 h-full">
      <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      
      {/* YouTube Embed Player */}
      <div className="rounded overflow-hidden mb-3 aspect-video">
        <iframe
          src={`${youtube.embedUrl}?rel=0&modestbranding=1`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="rounded"
          title={youtube.title}
        />
      </div>
      
      {/* Track info and Open in YouTube link */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-foreground truncate">
            {entry.exampleWork}
          </p>
          <p className="font-body text-xs text-muted-foreground truncate">
            {entry.artists}
          </p>
          {youtube.recordSales && (
            <p className="font-body text-[10px] text-primary/80 mt-1">
              📀 {youtube.recordSales}
            </p>
          )}
        </div>
        
        <a
          href={youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-medium rounded-full transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Watch
        </a>
      </div>
    </div>
  );
};

const MusicPlayer = ({ popular, timeless, isLoading }: MusicPlayerProps) => {
  // Check if we have any YouTube data
  const hasPopularYouTube = popular?.youtube;
  const hasTimelessYouTube = timeless?.youtube;
  const hasAnyYouTube = hasPopularYouTube || hasTimelessYouTube;

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="paper-card p-4">
            <div className="w-full aspect-video bg-muted/30 rounded flex items-center justify-center">
              <div className="loading-pulse" />
            </div>
          </div>
          <div className="paper-card p-4">
            <div className="w-full aspect-video bg-muted/30 rounded flex items-center justify-center">
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

  // If no YouTube data at all, show minimal placeholder
  if (!hasAnyYouTube) {
    return (
      <div className="w-full py-6">
        <p className="text-center font-body text-sm text-muted-foreground/60 italic">
          No videos available for this selection
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {popular && <YouTubeCard entry={popular} label="Most Popular" />}
        {timeless && <YouTubeCard entry={timeless} label="Most Timeless" />}
      </div>
    </div>
  );
};

export default MusicPlayer;
