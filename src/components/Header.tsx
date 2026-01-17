const Header = () => {
  return (
    <header className="pt-6 pb-4 px-4 text-center">
      <div className="flex items-center justify-center gap-3 mb-1">
        <img 
          src="/favicon.png" 
          alt="The Melting Pot logo" 
          className="w-8 h-8 md:w-10 md:h-10"
        />
        <h1 className="font-display text-2xl md:text-3xl font-light tracking-wide text-foreground">
          THE MELTING POT
        </h1>
      </div>
      <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
        Art through time and regions
      </p>
    </header>
  );
};

export default Header;