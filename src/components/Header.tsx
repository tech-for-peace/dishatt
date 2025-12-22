import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-hero text-primary-foreground py-16 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto text-center relative z-10">
        {/* Logo */}
        <div className="inline-flex items-center gap-3 mb-6 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-heading text-4xl font-bold tracking-tight">Disha</span>
        </div>

        {/* Tagline */}
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 animate-slide-up">
          Find Your Path to Wisdom
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
          Discover transformative videos from YouTube and Timeless Today. 
          Your journey to inner peace begins here.
        </p>
      </div>
    </header>
  );
}
