import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "progressive-overload-explained",
    title: "Progressive Overload Explained: The Key to Getting Stronger",
    excerpt:
      "Progressive overload is the single most important principle in strength training. Learn what it means, why it matters, and how to apply it to your programme for consistent gains.",
    date: "2026-01-15",
    readTime: "6 min read",
    category: "Training",
    content: `Progressive overload is the gradual increase of stress placed on the body during training. It is the foundational principle behind every successful strength programme, and understanding it can transform your results.

## What Is Progressive Overload?

At its core, progressive overload means doing a little more over time. This can take many forms: adding weight to the bar, performing more reps, increasing the number of sets, reducing rest periods, or improving the quality of your movement.

The human body is remarkably adaptive. When you challenge it with a stimulus it has not encountered before, it responds by getting stronger, building muscle, or improving endurance. But once it adapts to that stimulus, you need to increase the demand to keep progressing.

## Why It Matters

Without progressive overload, you plateau. Many gym-goers fall into the trap of doing the same exercises, with the same weights, for months or even years. They show up consistently but wonder why their body does not change. The missing ingredient is progression.

## How to Apply It

The simplest way to implement progressive overload is to track your workouts. Write down what you lift, how many reps you perform, and how it felt. Next session, aim to do slightly more. Here are practical strategies:

**Add weight.** If you completed all prescribed reps last session, add 1-2.5kg to the bar. Small increments add up quickly over weeks and months.

**Add reps.** Work within a rep range, for example 8-12 reps. Start at the bottom of the range with a given weight and build to the top before increasing load.

**Add sets.** If recovery allows, adding an extra set per exercise over a training block increases total volume and drives adaptation.

**Improve technique.** Better form means more muscle engagement and a stronger stimulus, even at the same weight. This is an often overlooked form of progression.

## A Word of Caution

Progressive overload must be balanced with adequate recovery. Pushing too hard too fast leads to fatigue, poor form, and injury. A well-designed programme manages the balance between stress and recovery, ensuring you progress sustainably.

At Cocoon Gym, every client programme is built around progressive overload. Your coach tracks your numbers, adjusts your plan, and ensures you are always moving forward, safely and effectively.`,
  },
  {
    slug: "protein-intake-guide",
    title: "How Much Protein Do You Really Need? A Practical Guide",
    excerpt:
      "From gym bros to dietitians, everyone has an opinion on protein. We break down the research into simple, actionable recommendations based on your training goals and lifestyle.",
    date: "2026-01-08",
    readTime: "8 min read",
    category: "Nutrition",
    content: `Protein is arguably the most discussed macronutrient in the fitness world, and for good reason. It plays a critical role in muscle repair, immune function, hormone production, and satiety. But how much do you actually need?

## The Research

The current body of evidence suggests the following daily protein intake ranges:

- **Sedentary adults:** 0.8g per kg of body weight (the RDA minimum)
- **Recreational exercisers:** 1.2-1.6g per kg
- **Strength athletes and serious trainees:** 1.6-2.2g per kg
- **During a calorie deficit:** up to 2.4g per kg to preserve muscle mass

For an 80kg person training regularly, that translates to roughly 130-175g of protein per day.

## Quality Matters

Not all protein sources are equal. Complete proteins contain all essential amino acids and are found in animal products like meat, fish, eggs, and dairy. Plant-based sources like legumes, tofu, and quinoa can absolutely meet your needs but may require more variety to cover all amino acids.

Leucine, a branched-chain amino acid, is particularly important for triggering muscle protein synthesis. Aim for 2-3g of leucine per meal, which typically means 25-40g of protein per sitting.

## Practical Tips

**Spread it out.** Distribute protein across 3-5 meals rather than loading it all into one or two sittings. This optimises muscle protein synthesis throughout the day.

**Prioritise whole foods.** Chicken, fish, eggs, Greek yogurt, cottage cheese, lentils, and tofu should form the foundation of your protein intake. Supplements like whey protein are convenient but not necessary.

**Plan ahead.** Protein-rich foods often require more preparation than carbs or fats. Batch cooking proteins on a Sunday can make weekday nutrition much easier.

**Do not overthink it.** If you are eating protein at every meal and hitting your daily target within a reasonable range, you are doing well. Perfection is not required.

## The Bottom Line

For most people training at Cocoon Gym, aiming for 1.6-2.0g of protein per kg of body weight is a solid target. Your coach can help you dial in the specifics based on your goals, preferences, and lifestyle.`,
  },
  {
    slug: "mobility-for-desk-workers",
    title: "5 Mobility Exercises Every Desk Worker Should Do Daily",
    excerpt:
      "Sitting for hours wreaks havoc on your hips, shoulders, and spine. These five simple exercises take less than 10 minutes and can dramatically improve how you feel and move.",
    date: "2025-12-20",
    readTime: "5 min read",
    category: "Mobility",
    content: `If you spend most of your day at a desk, your body pays the price. Tight hip flexors, rounded shoulders, a stiff thoracic spine, these are almost universal among office workers. The good news is that a few minutes of targeted mobility work each day can make a significant difference.

## 1. 90/90 Hip Stretch

Sit on the floor with one leg in front (shin parallel to your chest) and one leg to the side (shin perpendicular to your body), both knees bent at 90 degrees. Sit tall and lean gently over your front shin. Hold for 60 seconds each side.

**Why it works:** Opens up the hip capsule in both internal and external rotation, counteracting the constant hip flexion of sitting.

## 2. Thoracic Spine Rotation

Start on all fours. Place one hand behind your head and rotate your elbow toward the opposite knee, then rotate up toward the ceiling as far as you comfortably can. Perform 10 reps each side.

**Why it works:** Restores rotation in the mid-back, which gets locked up from hunching over a keyboard.

## 3. Wall Slides

Stand with your back flat against a wall, arms in a goalpost position (elbows and wrists touching the wall). Slowly slide your arms overhead while maintaining wall contact. Perform 10 slow reps.

**Why it works:** Activates the lower traps and serratus anterior while stretching the chest and shoulders. A direct antidote to forward head posture.

## 4. Couch Stretch

Kneel with one knee on the ground close to a wall, with your shin running up the wall behind you. Step the other foot forward into a lunge position. Squeeze the glute of your back leg and hold for 60 seconds each side.

**Why it works:** Aggressively stretches the hip flexors and quads, which shorten dramatically from prolonged sitting.

## 5. Dead Hang

Grab a pull-up bar with an overhand grip and simply hang with straight arms. Relax your shoulders and let gravity decompress your spine. Aim for 30-60 seconds.

**Why it works:** Decompresses the spine, stretches the lats and shoulders, and strengthens grip. One of the simplest and most effective things you can do for your body.

## Making It a Habit

The key is consistency, not duration. Set a recurring reminder and do these five exercises every day, either in the morning, during a lunch break, or before your evening training session. Within two weeks you will notice a meaningful difference in how you feel and move.

Join our Mobility & Recovery classes at Cocoon Gym for coached sessions that take your mobility work to the next level.`,
  },
  {
    slug: "building-workout-habit",
    title: "How to Build a Workout Habit That Actually Sticks",
    excerpt:
      "Motivation fades, but habits persist. Learn the psychology behind habit formation and practical strategies to make exercise a non-negotiable part of your routine.",
    date: "2025-12-12",
    readTime: "7 min read",
    category: "Mindset",
    content: `We have all been there: a burst of motivation, a new gym membership, two weeks of perfect attendance, and then life gets in the way. The workout habit fades and you are back to square one. The problem is not willpower. The problem is strategy.

## Why Motivation Fails

Motivation is an emotion, and like all emotions, it fluctuates. Relying on motivation to get to the gym is like relying on the weather to plan your life. Some days it shows up, most days it does not.

Successful exercisers do not have more motivation. They have better systems. They have turned exercise from a decision into an automatic behaviour, a habit.

## The Habit Loop

According to behavioural psychology, habits follow a simple loop: Cue, Routine, Reward.

**Cue:** A trigger that initiates the behaviour. This could be a time of day, a location, a preceding action, or an emotional state.

**Routine:** The behaviour itself. In this case, your workout.

**Reward:** The positive outcome that reinforces the loop. Endorphins, a sense of accomplishment, a post-workout coffee.

## Practical Strategies

**Start embarrassingly small.** If you are struggling to build the habit, commit to just showing up. Your goal is not a perfect workout. Your goal is to not miss. Even 15 minutes counts.

**Anchor to an existing habit.** Attach your workout to something you already do consistently. "After I drop the kids at school, I go to the gym." "Before I shower in the morning, I do 20 minutes of mobility."

**Remove friction.** Pack your gym bag the night before. Choose a gym close to home or work. Have a programme ready so you do not waste time deciding what to do.

**Track your streak.** Use a simple calendar or our client portal to mark each workout day. The visual streak becomes its own motivation.

**Embrace imperfect sessions.** A mediocre workout is infinitely better than a skipped one. Not every session needs to be your best. Showing up on the hard days is what separates people who succeed from those who do not.

## The Identity Shift

The most powerful change happens when exercise becomes part of your identity rather than something you do. You stop saying "I am trying to work out more" and start saying "I am someone who trains." This subtle shift makes the habit self-reinforcing.

At Cocoon Gym, we help clients build these systems. Your coach is there not just for programming but for accountability, the kind that makes missing a session feel uncomfortable in the best possible way.`,
  },
  {
    slug: "hiit-vs-steady-state",
    title: "HIIT vs Steady-State Cardio: Which Is Better for Fat Loss?",
    excerpt:
      "The debate between high-intensity intervals and steady-state cardio has raged for years. We look at the evidence and explain when to use each approach for optimal results.",
    date: "2025-12-01",
    readTime: "6 min read",
    category: "Training",
    content: `The fitness industry loves a good debate, and few topics generate more discussion than HIIT versus steady-state cardio for fat loss. The truth, as usual, is more nuanced than either camp suggests.

## What the Research Says

Multiple meta-analyses have compared HIIT and steady-state cardio for fat loss. The consistent finding is that both are effective, and when total calories burned are equated, the difference in fat loss is minimal.

HIIT does have a slight edge in time efficiency. A 20-minute HIIT session can burn a similar number of calories as a 40-minute steady-state session. There is also a modest post-exercise calorie burn (EPOC) from high-intensity work, though this effect is often overstated.

## When to Use HIIT

HIIT is ideal when you are short on time, enjoy intense workouts, and your body can handle the recovery demands. It improves cardiovascular fitness rapidly and adds variety to a training programme. Our HIIT Circuit classes at Cocoon Gym are designed to maximise these benefits in a coached group setting.

## When to Use Steady-State

Steady-state cardio (walking, cycling, jogging at a moderate pace) is easier to recover from, places less stress on joints, and can be done daily without interfering with strength training. For people already doing 3-4 strength sessions per week, adding steady-state cardio is often more sustainable than adding HIIT.

Walking, in particular, is massively underrated. A daily 30-minute walk can contribute 200-300 extra calories of expenditure with virtually zero recovery cost.

## The Best Approach

For most clients at Cocoon Gym, we recommend a combination. A typical week might include 3 strength sessions, 1-2 HIIT sessions, and daily walking. This provides comprehensive fitness benefits while keeping recovery manageable.

The best cardio for fat loss is the one you will actually do consistently. If you love running, run. If you love cycling, cycle. If you hate cardio entirely, find ways to increase your daily step count and let your strength training do the heavy lifting.

## The Bigger Picture

Cardio is one tool for fat loss, but it is not the most important one. A calorie deficit through nutrition, adequate protein intake, and a strength training programme to preserve muscle mass are the primary drivers. Cardio supports these efforts but should not be the centrepiece of a fat loss strategy.`,
  },
  {
    slug: "sleep-and-recovery",
    title: "Why Sleep Is Your Most Powerful Recovery Tool",
    excerpt:
      "You can have the perfect programme and diet, but without quality sleep your results will suffer. Discover the science of sleep and recovery, plus tips to improve your rest.",
    date: "2025-11-22",
    readTime: "7 min read",
    category: "Recovery",
    content: `Sleep is the most underrated performance enhancer available. It is free, it requires no equipment, and it affects virtually every aspect of your health and fitness. Yet most people sacrifice it without a second thought.

## Sleep and Muscle Growth

Growth hormone, which plays a key role in muscle repair and recovery, is primarily released during deep sleep. Studies show that sleep restriction significantly reduces muscle protein synthesis, even when protein intake and training are held constant.

In simple terms: you do not build muscle in the gym. You build muscle in your sleep.

## Sleep and Fat Loss

Poor sleep disrupts the hormones that regulate hunger and satiety. Ghrelin (the hunger hormone) increases, leptin (the satiety hormone) decreases, and cortisol (the stress hormone) rises. The result is increased appetite, cravings for high-calorie foods, and a reduced ability to stick to your nutrition plan.

Research has shown that people in a calorie deficit who sleep 5.5 hours per night lose significantly more muscle and less fat compared to those sleeping 8.5 hours, even when calorie intake is identical.

## Sleep and Performance

A single night of poor sleep can reduce strength by up to 20%, decrease time to exhaustion, impair reaction time, and increase perceived effort during exercise. Chronic sleep deprivation compounds these effects, leading to higher injury risk and slower recovery.

## How to Improve Your Sleep

**Be consistent.** Go to bed and wake up at roughly the same time every day, including weekends. Your circadian rhythm thrives on regularity.

**Create a dark, cool environment.** Aim for a bedroom temperature of 16-18 degrees Celsius. Use blackout curtains or an eye mask. Even small amounts of light can disrupt melatonin production.

**Limit screens before bed.** The blue light from phones and laptops suppresses melatonin. Aim for 30-60 minutes of screen-free time before sleep. Read a book, stretch, or practice breathing exercises.

**Watch your caffeine.** Caffeine has a half-life of 5-6 hours. A coffee at 15:00 means half the caffeine is still in your system at 21:00. Set a personal caffeine curfew, for most people around 12:00-14:00.

**Manage stress.** A racing mind is the most common barrier to falling asleep. Journaling, meditation, and structured breathing techniques (like 4-7-8 breathing) can help quiet the noise.

## The Bottom Line

If you are training hard but sleeping poorly, you are leaving results on the table. Prioritise 7-9 hours of quality sleep per night as seriously as you prioritise your training and nutrition. Your body and your performance will thank you.

At Cocoon Gym, we discuss sleep and recovery as part of our holistic coaching approach. It is not just about what happens in the gym. It is about what happens in the other 23 hours of the day.`,
  },
];

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

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = posts.find((p) => p.slug === slug);
    if (!post) {
      return { title: "Post Not Found" };
    }
    return {
      title: post.title,
      description: post.excerpt,
    };
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Find related posts (same category, excluding current)
  const relatedPosts = posts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  // Simple markdown-like rendering: split by double newline for paragraphs,
  // handle ## headings and **bold**
  const sections = post.content.split("\n\n");

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Article Header */}
      <section className="relative overflow-hidden bg-background pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Category */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[post.category] ?? "bg-primary/10 text-primary"}`}
            >
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Excerpt */}
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-4">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Article Body */}
      <section className="relative py-12 sm:py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose-custom space-y-6">
            {sections.map((section, i) => {
              const trimmed = section.trim();
              if (!trimmed) return null;

              // Heading
              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="text-2xl font-bold text-foreground mt-10 mb-4"
                  >
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }

              // Render paragraph with bold support
              const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p
                  key={i}
                  className="text-muted-foreground leading-relaxed"
                >
                  {parts.map((part, j) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={j} className="font-semibold text-foreground">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return <span key={j}>{part}</span>;
                  })}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-card/50">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Related Articles
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[related.category] ?? "bg-primary/10 text-primary"}`}
                    >
                      <Tag className="h-3 w-3" />
                      {related.category}
                    </span>
                    <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Put This Into <span className="text-primary">Practice</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Reading is great, but real change happens when you take action.
            Work with a Cocoon Gym coach to turn these principles into a
            personalised plan.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Book a Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-md border border-border px-8 py-3 text-sm font-medium text-foreground hover:bg-white/5 hover:border-primary/40 transition-colors"
            >
              More Articles
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
