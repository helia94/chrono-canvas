import { useState, useEffect } from "react";
import { Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { submitFeedback, fetchFeedbackCounts, type FeedbackType } from "@/lib/api";

interface ShareAndFeedbackProps {
  decade: string;
  region: string;
  artForm: string;
}

const ShareAndFeedback = ({ decade, region, artForm }: ShareAndFeedbackProps) => {
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });
  const [voted, setVoted] = useState<FeedbackType | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch counts when config changes
  useEffect(() => {
    setVoted(null);
    fetchFeedbackCounts(decade, region, artForm)
      .then(setCounts)
      .catch(() => setCounts({ likes: 0, dislikes: 0 }));
  }, [decade, region, artForm]);

  const handleShare = async () => {
    const params = new URLSearchParams({ decade, region, artForm });
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied to clipboard" });
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      toast({ description: "Link copied to clipboard" });
    }
  };

  const handleFeedback = async (type: FeedbackType) => {
    if (voted || loading) return;
    
    setLoading(true);
    try {
      const newCounts = await submitFeedback(decade, region, artForm, type);
      setCounts(newCounts);
      setVoted(type);
    } catch (error) {
      console.error("Feedback error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 text-muted-foreground/50">
      <button
        onClick={handleShare}
        className="hover:text-foreground transition-colors p-1"
        aria-label="Share this view"
        title="Copy link"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleFeedback("like")}
          className={`flex items-center gap-1 p-1 transition-colors ${
            voted === "like" 
              ? "text-primary" 
              : voted 
                ? "opacity-30 cursor-default" 
                : "hover:text-foreground"
          }`}
          aria-label="Like this content"
          disabled={!!voted || loading}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {counts.likes > 0 && (
            <span className="text-xs tabular-nums">{counts.likes}</span>
          )}
        </button>
        <button
          onClick={() => handleFeedback("dislike")}
          className={`flex items-center gap-1 p-1 transition-colors ${
            voted === "dislike" 
              ? "text-destructive" 
              : voted 
                ? "opacity-30 cursor-default" 
                : "hover:text-foreground"
          }`}
          aria-label="Dislike this content"
          disabled={!!voted || loading}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          {counts.dislikes > 0 && (
            <span className="text-xs tabular-nums">{counts.dislikes}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShareAndFeedback;
