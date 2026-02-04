import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FoodSpectrum } from "@/components/nutrition/food-spectrum";
import { VeggieRainbow } from "@/components/nutrition/veggie-rainbow";
import {
  Beef,
  Wheat,
  Droplet,
  Palette,
  Info,
  Leaf,
} from "lucide-react";

// ─── Page ────────────────────────────────────────────

export default function FoodGuidePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Food Spectrum Guide
        </h1>
        <p className="text-muted-foreground">
          A colour-coded guide to help you make better food choices. Based on the
          Precision Nutrition food spectrum approach.
        </p>
      </div>

      {/* How to Read This Guide */}
      <Card className="border-border/50 bg-secondary/30">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">How to use this guide</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Foods are categorised into three groups. <strong className="text-green-400">Eat More</strong>{" "}
              foods should form the majority of your meals - these are nutrient-dense and support your goals.{" "}
              <strong className="text-amber-400">Eat Some</strong> foods are fine in moderation and add variety.{" "}
              <strong className="text-red-400">Eat Less</strong> foods should be occasional
              treats, not daily staples. This is not about restriction - it is about building awareness.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Colour Key Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">Key:</span>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm text-green-400">Eat More</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-sm text-amber-400">Eat Some</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm text-red-400">Eat Less</span>
        </div>
      </div>

      {/* ─── Protein Sources ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Beef className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Protein Sources</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Protein is essential for muscle repair and growth. Prioritise lean,
          minimally processed sources and aim for a protein source at every meal.
        </p>
        <FoodSpectrum type="protein" />
      </section>

      <Separator />

      {/* ─── Carbohydrate Sources ────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wheat className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Carbohydrate Sources</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Carbohydrates fuel your training and recovery. Choose complex,
          fibre-rich sources that provide sustained energy rather than quick
          sugar spikes.
        </p>
        <FoodSpectrum type="carb" />
      </section>

      <Separator />

      {/* ─── Fat Sources ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Fat Sources</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Healthy fats are crucial for hormone production, brain function, and
          joint health. Focus on unsaturated fats and omega-3s. Remember, fats
          are calorie-dense (9 kcal/g), so portions matter.
        </p>
        <FoodSpectrum type="fat" />
      </section>

      <Separator />

      {/* ─── Vegetable Rainbow ───────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-violet-500" />
          <h2 className="text-lg font-semibold">Vegetable Rainbow</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Different coloured vegetables contain different phytonutrients and
          antioxidants. Eating a wide variety of colours ensures you get a broad
          spectrum of health benefits. Try to include at least 3 different colours
          at every meal.
        </p>
        <VeggieRainbow />
      </section>

      <Separator />

      {/* ─── Practical Tips ──────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-semibold">Practical Tips</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shopping Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Shop the perimeter of the supermarket first (fresh produce, meats, dairy)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  If it has more than 5 ingredients, think twice
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Buy seasonal produce from the Albert Cuyp or local markets
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Stock your freezer with frozen vegetables and lean meats
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Reading Labels</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Check protein content per 100g - aim for 15g+ in protein-focused foods
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Watch out for added sugars listed under different names
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Ingredients are listed by quantity - first items matter most
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Per portion sizes can be misleading - always check per 100g
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
