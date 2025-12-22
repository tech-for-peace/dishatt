export function Header() {
  return <header className="bg-hero text-primary-foreground py-16 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-3 mb-6 animate-fade-in">
        </div>
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{
        animationDelay: '100ms'
      }}>Discover videos from Timeless Today, Prem Rawat official YouTube channel. Begin your journey to inner peace here!</p>
      </div>
    </header>;
}
