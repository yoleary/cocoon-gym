import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background">
      {/* Background gradient layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Decorative orange accent elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-right corner accent */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full border border-primary/20" />
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full border border-primary/10" />

        {/* Bottom-left accent line */}
        <div className="absolute bottom-32 left-0 h-px w-48 bg-gradient-to-r from-primary/40 to-transparent" />
        <div className="absolute bottom-24 left-0 h-px w-32 bg-gradient-to-r from-primary/20 to-transparent" />

        {/* Floating dot accents */}
        <div className="absolute top-1/4 right-1/4 h-2 w-2 rounded-full bg-primary/40" />
        <div className="absolute top-1/3 left-1/5 h-1.5 w-1.5 rounded-full bg-primary/30" />
        <div className="absolute bottom-1/3 right-1/3 h-1 w-1 rounded-full bg-primary/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Amsterdam&apos;s Premier Personal Training Studio
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Transform Your Body,{" "}
            <span className="relative">
              <span className="relative z-10 text-primary">Elevate Your Mind</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/10 -skew-x-3" />
            </span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            At Cocoon Gym Amsterdam, we combine expert personal training with a
            holistic approach to fitness. Whether you&apos;re building strength,
            recovering from injury, or chasing performance goals, our coaches
            design programmes that fit your life.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20"
            >
              <Link href="/contact">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-semibold border-border text-foreground hover:bg-white/5 hover:border-primary/40"
            >
              <Link href="/login">Client Centre</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Clients Trained</div>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">8+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">4.9</div>
              <div className="text-sm text-muted-foreground">Google Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
