import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import {
  Heart,
  Shield,
  TrendingUp,
  Users,
  MapPin,
  Award,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Cocoon Gym Amsterdam, our training philosophy, our team of expert coaches, and what makes us different.",
};

const values = [
  {
    icon: Heart,
    title: "Client-First",
    description:
      "Every decision we make starts with what is best for our clients. Your goals shape your programme, not the other way around.",
  },
  {
    icon: Shield,
    title: "Evidence-Based",
    description:
      "Our coaching methods are grounded in sports science and exercise physiology. No fads, no gimmicks, just what works.",
  },
  {
    icon: TrendingUp,
    title: "Progressive",
    description:
      "We believe in structured progression. Every session builds on the last so you consistently improve without plateaus or burnout.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Fitness is better together. We foster a welcoming, inclusive environment where every member feels they belong.",
  },
] as const;

const trainers = [
  {
    name: "Daan de Vries",
    role: "Head Coach & Founder",
    credentials: "BSc Sports Science, NSCA-CSCS",
    bio: "Daan founded Cocoon Gym in 2017 after a decade of coaching professional athletes and everyday clients across the Netherlands. His passion is making high-level coaching accessible to everyone. Specialities include strength programming, athletic performance, and post-rehabilitation training.",
  },
  {
    name: "Lisa Mulder",
    role: "Senior Personal Trainer",
    credentials: "MSc Exercise Physiology, Pn1 Nutrition",
    bio: "Lisa brings a science-driven approach to body recomposition and sustainable fat loss. With a background in clinical exercise science, she excels at working with clients managing chronic conditions, postpartum recovery, and injury rehabilitation alongside their fitness goals.",
  },
  {
    name: "Kai Okonkwo",
    role: "Group Classes Lead",
    credentials: "BSc Human Movement, CrossFit L2, FMS",
    bio: "Kai is the energy behind our group programming. His classes blend strength, conditioning, and mobility into sessions that challenge and inspire. Before joining Cocoon, he coached at leading studios in London and Berlin, bringing an international perspective to functional fitness.",
  },
] as const;

export default function AboutPage() {
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
              Est. 2017 in Amsterdam
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Built on <span className="text-primary">Better Coaching</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Cocoon Gym started with a simple idea: personal training should
              be personal. Since 2017 we have been helping people across
              Amsterdam transform their health through expert coaching,
              structured programmes, and a community that genuinely cares.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Our Philosophy
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Fitness That Fits Your Life
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We believe lasting fitness comes from consistency, not intensity.
                Too many people burn out chasing extreme workouts or restrictive
                diets that cannot be sustained. At Cocoon Gym, we take a
                different approach.
              </p>
              <p>
                Our coaches design programmes that integrate with your real
                life: your work schedule, your recovery capacity, your food
                preferences, and your long-term goals. We meet you where you are
                and build from there.
              </p>
              <p>
                The name &ldquo;Cocoon&rdquo; reflects our belief in
                transformation. Just as a cocoon provides the environment for
                change, we create the conditions for you to become the
                strongest, healthiest version of yourself, at your own pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 sm:py-32 bg-card/50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              What We Stand For
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Values
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                  <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* Team */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              The Team
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Meet Your Coaches
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Qualified, experienced, and passionate about helping you succeed.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <div
                key={trainer.name}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Avatar placeholder */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {trainer.name}
                </h3>
                <p className="text-sm font-medium text-primary">
                  {trainer.role}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {trainer.credentials}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {trainer.bio}
                </p>
                <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="relative py-24 sm:py-32 bg-card/50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Location
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Find Us in the Heart of Amsterdam
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Located on the Keizersgracht in the canal district, Cocoon Gym
                is easily accessible by bike, tram, or on foot from anywhere in
                the city centre.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-sm text-muted-foreground">
                      Keizersgracht 123, 1015 CJ Amsterdam
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Transport</p>
                    <p className="text-sm text-muted-foreground">
                      5 min walk from Tram 13/17 Westermarkt stop. Bike parking
                      at the front door.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex h-80 items-center justify-center bg-muted/20">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-primary/30" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    Keizersgracht 123
                  </p>
                  <p className="text-xs text-muted-foreground">
                    1015 CJ Amsterdam
                  </p>
                  <a
                    href="https://maps.google.com/?q=Keizersgracht+123+Amsterdam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Open in Google Maps
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
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
            Come See <span className="text-primary">Cocoon Gym</span> for
            Yourself
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Book a free consultation, take a tour of the studio, and meet the
            team. No obligation, just a conversation about your goals.
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
