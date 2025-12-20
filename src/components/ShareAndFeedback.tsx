import { useState } from "react";
import { Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { submitFeedback, type FeedbackType } from "@/lib/api";

interface ShareAndFeedbackProps {
  decade: string;
  region: string;
  artForm: string;
}

const ShareAndFeedback = ({ decade, region, artForm }: ShareAndFeedbackProps) => {
  const [feedbackSent, setFeedbackSent] = useState<FeedbackType | null>(null);

  const handleShare = async () => {
    const params = new URLSearchParams({ decade, region, artForm });
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied to clipboard" });
    } catch {
      // Fallback for older browsers
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
    if (feedbackSent) return; // Already voted
    
    try {
      await submitFeedback(decade, region, artForm, type);
      setFeedbackSent(type);
      toast({ description: type === "like" ? "Thanks!" : "Noted, we'll improve" });
    } catch (error) {
      console.error("Feedback error:", error);
      // Still mark as sent to prevent spam
      setFeedbackSent(type);
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
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFeedback("like")}
          className={`p-1 transition-colors ${
            feedbackSent === "like" 
              ? "text-primary" 
              : feedbackSent 
                ? "opacity-30 cursor-default" 
                : "hover:text-foreground"
          }`}
          aria-label="Like this content"
          disabled={!!feedbackSent}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleFeedback("dislike")}
          className={`p-1 transition-colors ${
            feedbackSent === "dislike" 
              ? "text-destructive" 
              : feedbackSent 
                ? "opacity-30 cursor-default" 
                : "hover:text-foreground"
          }`}
          aria-label="Dislike this content"
          disabled={!!feedbackSent}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ShareAndFeedback;
