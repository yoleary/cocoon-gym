import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I came to Cocoon Gym after years of on-and-off gym memberships that never stuck. My trainer built a programme around my schedule and my goals, and for the first time I actually look forward to training. Down 12kg and feeling stronger than ever.",
    name: "Marieke van den Berg",
    descriptor: "Lost 12kg in 6 months",
  },
  {
    quote:
      "After my knee surgery, I was nervous about getting back into fitness. The team at Cocoon understood my limitations and gradually rebuilt my strength. I am now running again and recently completed my first 10K since the injury.",
    name: "Thomas Bakker",
    descriptor: "Post-surgery recovery",
  },
  {
    quote:
      "The group classes are incredible. The energy, the coaching, the community. I have tried big-box gyms and boutique studios across Amsterdam and nothing compares. The trainers know every member by name and adjust movements on the fly.",
    name: "Sophie Jansen",
    descriptor: "Group class member, 2 years",
  },
] as const;

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 bg-card/50">
      {/* Subtle top border accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            Testimonials
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Our Members Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real stories from real people who transformed their fitness at Cocoon Gym.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote className="h-8 w-8 text-primary/30" />
              </div>

              {/* Quote text */}
              <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-6 border-t border-border pt-4">
                <div className="font-semibold text-foreground">
                  {testimonial.name}
                </div>
                <div className="text-sm text-primary/80">
                  {testimonial.descriptor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle bottom border accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
}
