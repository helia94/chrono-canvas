import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { resolveEmotion, getEmotionSuggestions, EmotionWord, EmotionSuggestion } from "@/lib/api";

const quickEmotions = ["Calm", "Angry", "Bitter", "Joyful", "Melancholy", "Longing"];

const Emotion = () => {
  const [emotion, setEmotion] = useState("");
  const [result, setResult] = useState<{ intro: string; emotions: EmotionWord[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [getNew, setGetNew] = useState(false);
  const [suggestions, setSuggestions] = useState<EmotionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (emotion.trim().length < 1) {
        setSuggestions([]);
        return;
      }
      const results = await getEmotionSuggestions(emotion.trim());
      setSuggestions(results);
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [emotion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (name: string) => {
    setEmotion(name);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emotion.trim() || loading) return;

    setShowSuggestions(false);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await resolveEmotion(emotion.trim(), !getNew);
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
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your emotion..."
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion.name)}
                      className="w-full px-4 py-2 text-left font-body text-foreground hover:bg-primary/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

          {/* Get New toggle */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setGetNew(!getNew)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm transition-all ${
                getNew
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/30"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${getNew ? "text-primary" : ""}`} />
              <span>Get New</span>
            </button>
            {getNew && (
              <span className="text-xs text-muted-foreground">
                Fresh results from AI
              </span>
            )}
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
