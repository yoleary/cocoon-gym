import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import {
  ClipboardCheck,
  Target,
  BarChart3,
  Apple,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Personal Training",
  description:
    "One-on-one personal training at Cocoon Gym Amsterdam. Custom programmes, expert coaching, and real results. Book your free consultation today.",
};

const approach = [
  {
    icon: ClipboardCheck,
    title: "Assessment",
    description:
      "Every journey begins with a comprehensive movement assessment, body composition analysis, and an in-depth conversation about your history, lifestyle, and goals. We identify your strengths, limitations, and the fastest path to results.",
  },
  {
    icon: Target,
    title: "Programming",
    description:
      "Your coach designs a fully personalised training programme built around your schedule, equipment preferences, and progression targets. No cookie-cutter templates. Every session has a purpose.",
  },
  {
    icon: BarChart3,
    title: "Tracking",
    description:
      "Through our client portal you can view every workout, track your lifts, monitor body metrics, and see your progress over time. Your coach reviews your data weekly to fine-tune the plan.",
  },
  {
    icon: Apple,
    title: "Nutrition",
    description:
      "Training is only half the equation. We provide practical nutrition guidance that fits your lifestyle, whether that means meal frameworks, calorie targets, or full macro coaching alongside your programme.",
  },
] as const;

const benefits = [
  "Programmes tailored to your body and goals",
  "Flexible scheduling: early mornings to late evenings",
  "Access to the client portal for workout tracking",
  "Regular progress check-ins and programme adjustments",
  "Injury-aware coaching with rehab exercise integration",
  "Nutrition guidance included with all packages",
] as const;

export default function PersonalTrainingPage() {
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
              1-on-1 Expert Coaching
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Personal Training{" "}
              <span className="text-primary">That Delivers</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Work directly with an experienced coach who understands your body,
              your schedule, and your ambitions. At Cocoon Gym Amsterdam, every
              session is designed to move you closer to your goals.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Book a Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-md border border-border px-8 py-3 text-sm font-semibold text-foreground hover:bg-white/5 hover:border-primary/40 transition-colors"
              >
                Meet Our Coaches
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Our Approach
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Structured for Results
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every client follows a proven four-step framework that takes the
              guesswork out of training and keeps you progressing week after
              week.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
            {approach.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-primary/40">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
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
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Why Choose Us
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                More Than Just a Workout
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our personal training goes beyond counting reps. We build a
                complete system around your training that supports your goals
                inside and outside the gym.
              </p>
              <ul className="mt-8 space-y-4">
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

            {/* Pricing placeholder */}
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                  Pricing
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Personal / Duo Training Prices
                </h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-primary/40 bg-primary/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">1-1 Personal Training</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">From</div>
                      <div className="text-2xl font-bold text-foreground">
                        &euro;85
                      </div>
                      <div className="text-xs text-muted-foreground">per session</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/40 bg-primary/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">Duo Personal Training</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">From</div>
                      <div className="text-2xl font-bold text-foreground">
                        &euro;100
                      </div>
                      <div className="text-xs text-muted-foreground">per session</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your First Session is a{" "}
            <span className="text-primary">Free Consultation</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            No commitment, no pressure. Come in, meet your coach, do a trial
            session, and see if Cocoon Gym is the right fit for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Book Your Free Consultation
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
