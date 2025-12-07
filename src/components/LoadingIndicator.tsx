interface LoadingIndicatorProps {
  isVisible: boolean;
}

const LoadingIndicator = ({ isVisible }: LoadingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
      {/* Animated dots */}
      <div className="flex gap-1">
        <span 
          className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" 
          style={{ animationDelay: "0ms", animationDuration: "1s" }} 
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" 
          style={{ animationDelay: "150ms", animationDuration: "1s" }} 
        />
        <span 
          className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" 
          style={{ animationDelay: "300ms", animationDuration: "1s" }} 
        />
      </div>
      <span className="font-body text-xs text-muted-foreground/70 italic">
        Consulting the AI gods...
      </span>
    </div>
  );
};

export default LoadingIndicator;