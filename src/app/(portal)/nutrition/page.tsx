import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DailyFoundations } from "@/components/nutrition/daily-foundations";
import { MealGuide } from "@/components/nutrition/meal-guide";
import {
  Apple,
  Target,
  Ban,
  Grape,
  Wine,
  Brain,
  ArrowRightLeft,
  AlertTriangle,
  Utensils,
  Sparkles,
  Heart,
  Scale,
} from "lucide-react";

// ─── Page ────────────────────────────────────────────

export default function NutritionPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nutrition Foundations
        </h1>
        <p className="text-muted-foreground">
          Simple, sustainable nutrition principles to support your training and
          health goals.
        </p>
      </div>

      {/* ─── Daily Non-Negotiables ───────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Daily Non-Negotiables</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Before worrying about macros or meal timing, nail these three habits
          every single day. They form the base of your health pyramid.
        </p>
        <DailyFoundations />
      </section>

      <Separator />

      {/* ─── Nutrition Guidelines ────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Nutrition Guidelines</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Protein Target */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                  <Target className="h-4 w-4 text-orange-500" />
                </div>
                Protein Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums text-orange-500">
                  1.6 - 2.2
                </span>
                <span className="text-sm text-muted-foreground">
                  g per kg bodyweight
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Protein is the most important macronutrient for body composition.
                Aim for a palm-sized portion of protein at every meal. For a 75kg
                person, that is roughly 120-165g of protein per day.
              </p>
            </CardContent>
          </Card>

          {/* General Approach */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Apple className="h-4 w-4 text-green-500" />
                </div>
                Plate Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Build every meal using this simple framework:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  <span>
                    <strong className="text-foreground">1/4 plate protein</strong>{" "}
                    - meat, fish, eggs, tofu
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                  <span>
                    <strong className="text-foreground">1/2 plate vegetables</strong>{" "}
                    - colourful, varied, fibrous
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <span>
                    <strong className="text-foreground">1/4 plate smart carbs</strong>{" "}
                    - whole grains, potatoes, legumes
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <span>
                    <strong className="text-foreground">Thumb of healthy fats</strong>{" "}
                    - olive oil, avocado, nuts
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ─── Meal Examples ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Meal Examples</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Practical, easy-to-prepare meal ideas with protein content highlighted.
          These are based on foods readily available in Amsterdam supermarkets.
        </p>
        <MealGuide />
      </section>

      <Separator />

      {/* ─── What to Avoid ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold">What to Minimise</h2>
        </div>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Processed Foods
                </h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    Ultra-processed snacks and ready meals
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    Sugary drinks and sodas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    Deep-fried foods
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    White bread and refined grains
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Hidden Calories
                </h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    Sauces and dressings (they add up fast)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    Cooking oils used liberally
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    "Healthy" granola bars and muesli
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    Flavoured coffees and smoothies
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ─── Fruit & Sugar Awareness ─────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Grape className="h-5 w-5 text-violet-500" />
          <h2 className="text-lg font-semibold">Fruit & Sugar Awareness</h2>
        </div>

        <Card className="border-border/50">
          <CardContent className="space-y-4 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Fruit is healthy and full of vitamins, but it still contains natural
              sugars. Be mindful of portions, especially if fat loss is your goal.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <h4 className="mb-2 text-sm font-semibold text-green-400">
                  Best Choices (Lower Sugar)
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Berries (strawberries, blueberries, raspberries)</li>
                  <li>Green apples</li>
                  <li>Grapefruit</li>
                  <li>Kiwi</li>
                  <li>Watermelon (high volume, low cal)</li>
                </ul>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <h4 className="mb-2 text-sm font-semibold text-amber-400">
                  Moderate (Higher Sugar)
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Bananas (great pre-workout though)</li>
                  <li>Grapes</li>
                  <li>Mangoes</li>
                  <li>Pineapple</li>
                  <li>Dried fruits (very calorie-dense)</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Aim for 2-3 portions of fruit per day. Pair fruit with a protein
              source (e.g., apple with almond butter) to slow sugar absorption.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ─── Alcohol Guidance ────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wine className="h-5 w-5 text-rose-500" />
          <h2 className="text-lg font-semibold">Alcohol Guidance</h2>
        </div>

        <Card className="border-border/50">
          <CardContent className="space-y-4 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Alcohol directly impacts your training recovery, sleep quality, and
              body composition goals. It provides empty calories (7 kcal/g) and
              impairs protein synthesis for up to 48 hours.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-green-400">Ideal</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  0-2 drinks per week
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">Moderate</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  3-5 drinks per week
                </p>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-red-400">Limiting</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  6+ drinks per week
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">If you do drink:</strong>{" "}
                Choose clear spirits with soda water, dry wine, or light beer.
                Avoid cocktails with sugary mixers. Never drink the night before
                training, and always rehydrate fully afterwards.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ─── Mindset & Consistency ───────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Mindset & Consistency</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-amber-500" />
                The 80/20 Rule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Aim to eat well 80% of the time. Allow yourself flexibility for
                social events, treats, and life. Perfection is not the goal.
                Consistency over months and years is what transforms your body
                and health.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-rose-500" />
                Progress Not Perfection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                One bad meal does not ruin your progress, just like one good meal
                does not make you healthy. Focus on the next meal, not the last
                one. Build sustainable habits that fit your lifestyle.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardContent className="py-4">
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Meal prep on Sundays</strong>{" "}
                  - even just cooking protein and grains saves decisions all week
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Eat slowly</strong> - take
                  20 minutes per meal and chew your food properly
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Stop at 80% full</strong>{" "}
                  - it takes time for satiety signals to reach your brain
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Never shop hungry</strong>{" "}
                  - make a list and stick to the perimeter of the supermarket
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ─── Food Swap Hacks ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Food Swap Hacks</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Small swaps add up to big results over time. These are not about
          deprivation, they are about making smarter choices that still taste
          great.
        </p>

        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="space-y-3">
              {FOOD_SWAPS.map((swap) => (
                <div
                  key={swap.from}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-red-400 line-through">
                      {swap.from}
                    </p>
                  </div>
                  <ArrowRightLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-sm font-medium text-green-400">
                      {swap.to}
                    </p>
                  </div>
                  {swap.saving && (
                    <span className="shrink-0 rounded-md bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-400">
                      {swap.saving}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ─── Food Swap Data ─────────────────────────────────

const FOOD_SWAPS = [
  {
    from: "White rice",
    to: "Cauliflower rice (or 50/50 mix)",
    saving: "-150 kcal",
  },
  {
    from: "Crisps",
    to: "Rice cakes with nut butter",
    saving: "-120 kcal",
  },
  {
    from: "Sugary cereal",
    to: "Overnight oats with berries",
    saving: "-100 kcal",
  },
  {
    from: "Mayo",
    to: "Greek yoghurt with mustard",
    saving: "-80 kcal",
  },
  {
    from: "Regular pasta",
    to: "Courgetti or protein pasta",
    saving: "-200 kcal",
  },
  {
    from: "Milk chocolate",
    to: "85% dark chocolate (2 squares)",
    saving: "-100 kcal",
  },
  {
    from: "Soft drink (330ml)",
    to: "Sparkling water with lemon",
    saving: "-140 kcal",
  },
  {
    from: "Cream-based sauce",
    to: "Tomato-based or pesto (small amount)",
    saving: "-150 kcal",
  },
];
