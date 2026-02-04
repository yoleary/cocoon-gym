import Link from "next/link";
import { Dumbbell, Users, Apple, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Dumbbell,
    title: "Personal Training",
    description:
      "One-on-one sessions tailored to your goals. Our certified trainers build progressive programmes that challenge you safely, track your metrics, and keep you accountable every step of the way.",
    href: "/personal-training",
  },
  {
    icon: Users,
    title: "Group Classes",
    description:
      "High-energy small-group sessions that combine strength, conditioning, and community. From HIIT circuits to mobility workshops, there is a class for every fitness level.",
    href: "/group-classes",
  },
  {
    icon: Apple,
    title: "Nutrition Coaching",
    description:
      "Fuel your training with a sustainable nutrition plan. Our coaches help you build habits that support your performance, recovery, and long-term health without restrictive diets.",
    href: "/nutrition",
  },
] as const;

export function ServicesGrid() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            Our Services
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete approach to fitness that goes beyond the gym floor.
          </p>
        </div>

        {/* Grid */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Icon */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                {/* Link */}
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {/* Hover accent line at top */}
                <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
