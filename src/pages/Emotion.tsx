import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Loader2, Sparkles } from "lucide-react";
import { resolveEmotion, EmotionWord } from "@/lib/api";

const quickEmotions = ["Calm", "Angry", "Bitter", "Joyful", "Melancholy", "Longing"];

const Emotion = () => {
  const [emotion, setEmotion] = useState("");
  const [result, setResult] = useState<{ intro: string; emotions: EmotionWord[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emotion.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await resolveEmotion(emotion.trim());
      setResult(data);
    } catch (err) {
      console.error("Request failed:", err);
      setError("Failed to explore this emotion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEmotion = (item: string) => {
    setEmotion(item);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm tracking-wide">Back</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Heart className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-wide text-foreground">
              Emotion Explorer
            </h1>
            <p className="font-body text-muted-foreground max-w-lg mx-auto">
              Discover nuanced emotions from cultures around the world.
              Words that capture feelings English cannot express.
            </p>
          </div>
        </div>

        {/* Quick emotion buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {quickEmotions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleQuickEmotion(item)}
              className={`art-form-btn ${emotion === item ? "selected" : ""}`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your emotion..."
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="flex-1 px-4 py-3 bg-card border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !emotion.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exploring...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explore</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="text-center text-destructive mb-8 font-body">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 paper-fold-enter">
            {/* Intro */}
            <div className="text-center">
              <div className="ochre-rule mb-6" />
              <p className="font-body text-lg text-foreground/90 italic max-w-2xl mx-auto">
                {result.intro}
              </p>
              <div className="ochre-rule mt-6" />
            </div>

            {/* Emotion cards grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {result.emotions.map((item, idx) => (
                <div
                  key={idx}
                  className="paper-card p-6 space-y-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="space-y-1">
                    <h3 className="font-display text-xl text-foreground">
                      {item.name}
                    </h3>
                    <p className="text-sm text-primary font-medium tracking-wide uppercase">
                      {item.language}
                    </p>
                  </div>

                  <p className="font-body text-foreground/80">
                    {item.meaning}
                  </p>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      <span className="font-medium text-foreground/70">Cultural context:</span>{" "}
                      {item.cultural_context}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="text-center mt-16">
            <p className="text-sm text-muted-foreground/60 italic font-body">
              Enter an emotion to discover words from around the world
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Emotion;
