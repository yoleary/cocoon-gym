import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Fitness tips, training advice, and nutrition insights from the coaches at Cocoon Gym Amsterdam.",
};

const posts = [
  {
    slug: "progressive-overload-explained",
    title: "Progressive Overload Explained: The Key to Getting Stronger",
    excerpt:
      "Progressive overload is the single most important principle in strength training. Learn what it means, why it matters, and how to apply it to your programme for consistent gains.",
    date: "2026-01-15",
    readTime: "6 min read",
    category: "Training",
  },
  {
    slug: "protein-intake-guide",
    title: "How Much Protein Do You Really Need? A Practical Guide",
    excerpt:
      "From gym bros to dietitians, everyone has an opinion on protein. We break down the research into simple, actionable recommendations based on your training goals and lifestyle.",
    date: "2026-01-08",
    readTime: "8 min read",
    category: "Nutrition",
  },
  {
    slug: "mobility-for-desk-workers",
    title: "5 Mobility Exercises Every Desk Worker Should Do Daily",
    excerpt:
      "Sitting for hours wreaks havoc on your hips, shoulders, and spine. These five simple exercises take less than 10 minutes and can dramatically improve how you feel and move.",
    date: "2025-12-20",
    readTime: "5 min read",
    category: "Mobility",
  },
  {
    slug: "building-workout-habit",
    title: "How to Build a Workout Habit That Actually Sticks",
    excerpt:
      "Motivation fades, but habits persist. Learn the psychology behind habit formation and practical strategies to make exercise a non-negotiable part of your routine.",
    date: "2025-12-12",
    readTime: "7 min read",
    category: "Mindset",
  },
  {
    slug: "hiit-vs-steady-state",
    title: "HIIT vs Steady-State Cardio: Which Is Better for Fat Loss?",
    excerpt:
      "The debate between high-intensity intervals and steady-state cardio has raged for years. We look at the evidence and explain when to use each approach for optimal results.",
    date: "2025-12-01",
    readTime: "6 min read",
    category: "Training",
  },
  {
    slug: "sleep-and-recovery",
    title: "Why Sleep Is Your Most Powerful Recovery Tool",
    excerpt:
      "You can have the perfect programme and diet, but without quality sleep your results will suffer. Discover the science of sleep and recovery, plus tips to improve your rest.",
    date: "2025-11-22",
    readTime: "7 min read",
    category: "Recovery",
  },
] as const;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  Training: "bg-primary/10 text-primary",
  Nutrition: "bg-green-500/10 text-green-400",
  Mobility: "bg-blue-500/10 text-blue-400",
  Mindset: "bg-purple-500/10 text-purple-400",
  Recovery: "bg-yellow-500/10 text-yellow-400",
};

export default function BlogPage() {
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
              Training, Nutrition & Mindset
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Cocoon <span className="text-primary">Blog</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Evidence-based articles from our coaching team to help you train
              smarter, eat better, and build a healthier lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Category badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[post.category] ?? "bg-primary/10 text-primary"}`}
                  >
                    <Tag className="h-3 w-3" />
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Hover accent */}
                <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="relative py-20 bg-card/50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stay Up to <span className="text-primary">Date</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            New articles every week on training, nutrition, and mindset. Follow
            us on social media or book a consultation to discuss your goals with
            a coach.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Talk to a Coach
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      <Footer />
    </main>
  );
}
