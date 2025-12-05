const Header = () => {
  return (
    <header className="pt-16 pb-12 px-8 text-center">
      <h1 className="font-display text-4xl md:text-5xl font-light tracking-wide text-foreground mb-3">
        ChronoArt Atlas
      </h1>
      <p className="font-body text-sm md:text-base text-muted-foreground tracking-widest uppercase mb-10">
        Art through decades and regions
      </p>
      <div className="ochre-rule" />
    </header>
  );
};

export default Header;
