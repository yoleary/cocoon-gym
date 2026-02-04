import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import {
  Dumbbell,
  Zap,
  Activity,
  Clock,
  Users,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Group Classes",
  description:
    "Small-group fitness classes at Cocoon Gym Amsterdam. Strength & Conditioning, HIIT, and Mobility sessions led by expert coaches.",
};

const classes = [
  {
    icon: Dumbbell,
    title: "Strength & Conditioning",
    description:
      "Build functional strength with barbell, dumbbell, and bodyweight movements. Sessions follow a progressive overload model so you get stronger week after week. Suitable for all levels with scaling options for every exercise.",
    duration: "55 min",
    capacity: "8 people",
    schedule: "Mon / Wed / Fri",
    times: ["07:00", "12:00", "18:30"],
    level: "All Levels",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "HIIT Circuit",
    description:
      "High-intensity interval training designed to torch calories and boost cardiovascular fitness. Rotating stations keep every session fresh, and heart-rate monitoring ensures you are working at the right intensity for your goals.",
    duration: "40 min",
    capacity: "10 people",
    schedule: "Tue / Thu / Sat",
    times: ["07:00", "12:30", "17:30"],
    level: "Intermediate+",
    color: "text-red-400",
  },
  {
    icon: Activity,
    title: "Mobility & Recovery",
    description:
      "Improve your range of motion, reduce injury risk, and accelerate recovery. Combining dynamic stretching, foam rolling, and movement flow sequences, this class is the perfect complement to your strength and conditioning work.",
    duration: "45 min",
    capacity: "12 people",
    schedule: "Wed / Fri / Sun",
    times: ["08:00", "19:30"],
    level: "All Levels",
    color: "text-green-400",
  },
] as const;

const benefits = [
  "Expert coaching with real-time form corrections",
  "Small groups ensure personalised attention",
  "Progressive programming, not random workouts",
  "Heart-rate tracking available for HIIT classes",
  "Community atmosphere that keeps you motivated",
  "Drop-in or membership options available",
] as const;

export default function GroupClassesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden bg-background pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Small Group Training
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Group Classes with{" "}
              <span className="text-primary">Real Coaching</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Not your average group fitness class. Our small-group sessions are
              coached, not instructed. Every movement is cued, corrected, and
              scaled so you train safely and effectively.
            </p>
          </div>
        </div>
      </section>

      {/* Class Schedule Cards */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Weekly Schedule
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Find Your Class
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three distinct class formats designed to build a well-rounded
              athlete. Mix and match to suit your goals.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {classes.map((cls) => {
              const Icon = cls.icon;
              return (
                <div
                  key={cls.title}
                  className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {cls.title}
                      </h3>
                      <span className={`text-xs font-medium ${cls.color}`}>
                        {cls.level}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {cls.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary/60" />
                      <span>{cls.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-primary/60" />
                      <span>Max {cls.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-primary/60" />
                      <span>{cls.schedule}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {cls.times.map((time) => (
                        <span
                          key={time}
                          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hover accent */}
                  <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-24 sm:py-32 bg-card/50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              The Cocoon Difference
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Our Classes Work
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Small groups, expert programming, and coaches who know your name.
            </p>

            <ul className="mt-12 grid gap-4 text-left sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* How to Join CTA */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="text-primary">Join a Class</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
              Getting started is simple. Book a free trial class to experience
              our coaching first-hand, or sign up for a class package and start
              training this week.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-3 text-left max-w-2xl mx-auto">
              <div className="rounded-lg border border-border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  Book a Trial
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pick any class and try it free
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  Choose a Package
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Flexible monthly or pay-per-class
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  Start Training
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Book classes via the client portal
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Book Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/personal-training"
                className="inline-flex items-center justify-center rounded-md border border-border px-8 py-3 text-sm font-semibold text-foreground hover:bg-white/5 hover:border-primary/40 transition-colors"
              >
                Prefer 1-on-1? See Personal Training
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
