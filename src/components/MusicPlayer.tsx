import { type ArtEntry } from "@/lib/api";

interface MusicPlayerProps {
  popular: ArtEntry | null;
  timeless: ArtEntry | null;
  isLoading: boolean;
}

interface SpotifyCardProps {
  entry: ArtEntry;
  label: string;
}

const SpotifyCard = ({ entry, label }: SpotifyCardProps) => {
  const spotify = entry.spotify;
  
  if (!spotify) {
    return (
      <div className="paper-card p-4 h-full">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
        <div className="w-full h-20 bg-muted/20 rounded flex items-center justify-center border border-dashed border-muted-foreground/20">
          <span className="font-body text-sm text-muted-foreground/50 italic">
            Spotify track not available
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
      
      {/* Spotify Embed Player */}
      <div className="rounded overflow-hidden mb-3">
        <iframe
          src={`${spotify.embedUrl}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded"
          title={`${spotify.name} by ${spotify.artist}`}
        />
      </div>
      
      {/* Track info and Open in Spotify link */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-foreground truncate">
            {spotify.name}
          </p>
          <p className="font-body text-xs text-muted-foreground truncate">
            {spotify.artist}
          </p>
        </div>
        
        <a
          href={spotify.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs font-medium rounded-full transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Open
        </a>
      </div>
    </div>
  );
};

const MusicPlayer = ({ popular, timeless, isLoading }: MusicPlayerProps) => {
  // Check if we have any Spotify data
  const hasPopularSpotify = popular?.spotify;
  const hasTimelessSpotify = timeless?.spotify;
  const hasAnySpotify = hasPopularSpotify || hasTimelessSpotify;

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="paper-card p-4">
            <div className="w-full h-[200px] bg-muted/30 rounded flex items-center justify-center">
              <div className="loading-pulse" />
            </div>
          </div>
          <div className="paper-card p-4">
            <div className="w-full h-[200px] bg-muted/30 rounded flex items-center justify-center">
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

  // If no Spotify data at all, show minimal placeholder
  if (!hasAnySpotify) {
    return (
      <div className="w-full py-6">
        <p className="text-center font-body text-sm text-muted-foreground/60 italic">
          No Spotify tracks available for this selection
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {popular && <SpotifyCard entry={popular} label="Most Popular" />}
        {timeless && <SpotifyCard entry={timeless} label="Most Timeless" />}
      </div>
    </div>
  );
};

export default MusicPlayer;
