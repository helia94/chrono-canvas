import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";

const Emotion = () => {
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
        
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-wide text-foreground">
              Emotion Explorer
            </h1>
            <p className="font-body text-muted-foreground max-w-md mx-auto">
              Coming soon — discover art through the lens of human emotion. 
              Find works that evoke joy, melancholy, wonder, and everything in between.
            </p>
          </div>
          
          <div className="ochre-rule" />
          
          <p className="text-sm text-muted-foreground/60 italic">
            This experience is being crafted with care.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Emotion;