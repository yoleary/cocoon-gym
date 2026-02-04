import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ContactForm } from "@/components/site/contact-form";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Cocoon Gym Amsterdam. Book a free consultation, ask questions, or visit our studio.",
};

const openingHours = [
  { day: "Monday - Friday", hours: "06:00 - 21:00" },
  { day: "Saturday", hours: "08:00 - 18:00" },
  { day: "Sunday", hours: "09:00 - 16:00" },
] as const;

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden bg-background pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              We&apos;d Love to Hear From You
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Whether you are ready to start training or just have a question,
              we are here to help. Fill out the form below or drop by the
              studio anytime during opening hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Map */}
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Address */}
            <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Visit Us
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sloterkade 169
              </p>
              <p className="text-sm text-muted-foreground">
                1059 EB Amsterdam
              </p>
              <p className="text-sm text-muted-foreground">The Netherlands</p>
              <a
                href="https://maps.google.com/?q=Sloterkade+169+Amsterdam"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Open in Google Maps
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            {/* Contact Details */}
            <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Contact Details
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary/60" />
                  <a
                    href="tel:+31201234567"
                    className="hover:text-primary transition-colors"
                  >
                    +31 20 123 4567
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary/60" />
                  <a
                    href="mailto:info@cocoongym.nl"
                    className="hover:text-primary transition-colors"
                  >
                    info@cocoongym.nl
                  </a>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                We typically respond within 24 hours on business days.
              </p>
            </div>

            {/* Opening Hours */}
            <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Opening Hours
              </h3>
              <div className="mt-2 space-y-2">
                {openingHours.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.day}</span>
                    <span className="font-medium text-foreground">
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Closed on public holidays. Personal training by appointment
                outside regular hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex h-64 items-center justify-center bg-muted/20">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-primary/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Sloterkade 169, Amsterdam
                </p>
                <p className="text-xs text-muted-foreground">
                  1059 EB Amsterdam
                </p>
                <a
                  href="https://maps.google.com/?q=Sloterkade+169+Amsterdam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View on Google Maps
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />

      <Footer />
    </main>
  );
}
