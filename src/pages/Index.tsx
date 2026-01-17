import { Link } from "react-router-dom";
import { Globe, Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <img 
            src="/favicon.png" 
            alt="The Melting Pot logo" 
            className="w-16 h-16 mx-auto mb-6"
          />
          <h1 className="font-display text-3xl md:text-5xl font-light tracking-wide text-foreground mb-4">
            THE MELTING POT
          </h1>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            A project to melt the world — exploring the fusion of art, culture, 
            and human expression across time and borders.
          </p>
        </div>

        <div className="ochre-rule mb-12" />

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
          <Link 
            to="/art"
            className="group paper-card p-8 text-center rounded-sm transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-light tracking-wide text-foreground mb-2">
              Art Explorer
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Journey through decades and regions to discover iconic works 
              in visual arts, music, and literature.
            </p>
          </Link>

          <Link 
            to="/emotion"
            className="group paper-card p-8 text-center rounded-sm transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
              <Heart className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-light tracking-wide text-foreground mb-2">
              Emotion Explorer
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Discover art through the lens of human emotion — 
              joy, melancholy, wonder, and beyond.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground/50 tracking-widest uppercase">
          Melting boundaries since 2024
        </p>
      </footer>
    </div>
  );
};

export default Index;