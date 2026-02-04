import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Data ───────────────────────────────────────────

const RAINBOW_GROUPS = [
  {
    color: "Red",
    bgGradient: "from-red-500/15 to-red-500/5",
    borderColor: "border-red-500/30",
    dotColor: "bg-red-500",
    textColor: "text-red-400",
    phytonutrient: "Lycopene & Anthocyanins",
    benefit: "Heart health, anti-inflammatory, cancer prevention",
    vegetables: [
      "Tomatoes",
      "Red peppers",
      "Beetroot",
      "Red cabbage",
      "Radishes",
      "Red onions",
    ],
  },
  {
    color: "Orange",
    bgGradient: "from-orange-500/15 to-orange-500/5",
    borderColor: "border-orange-500/30",
    dotColor: "bg-orange-500",
    textColor: "text-orange-400",
    phytonutrient: "Beta-carotene",
    benefit: "Eye health, immune support, skin health",
    vegetables: [
      "Carrots",
      "Sweet potatoes",
      "Butternut squash",
      "Orange peppers",
      "Pumpkin",
      "Turmeric root",
    ],
  },
  {
    color: "Yellow",
    bgGradient: "from-yellow-500/15 to-yellow-500/5",
    borderColor: "border-yellow-500/30",
    dotColor: "bg-yellow-500",
    textColor: "text-yellow-400",
    phytonutrient: "Lutein & Zeaxanthin",
    benefit: "Eye protection, anti-inflammatory, digestion",
    vegetables: [
      "Yellow peppers",
      "Sweetcorn",
      "Yellow courgette",
      "Ginger root",
      "Yellow tomatoes",
      "Yellow beets",
    ],
  },
  {
    color: "Green",
    bgGradient: "from-green-500/15 to-green-500/5",
    borderColor: "border-green-500/30",
    dotColor: "bg-green-500",
    textColor: "text-green-400",
    phytonutrient: "Sulforaphane & Chlorophyll",
    benefit: "Detoxification, bone health, energy production",
    vegetables: [
      "Broccoli",
      "Spinach",
      "Kale",
      "Courgette",
      "Green beans",
      "Asparagus",
      "Brussels sprouts",
      "Cucumber",
    ],
  },
  {
    color: "Blue / Purple",
    bgGradient: "from-violet-500/15 to-violet-500/5",
    borderColor: "border-violet-500/30",
    dotColor: "bg-violet-500",
    textColor: "text-violet-400",
    phytonutrient: "Anthocyanins & Resveratrol",
    benefit: "Brain health, memory, anti-aging properties",
    vegetables: [
      "Aubergine",
      "Purple cabbage",
      "Purple carrots",
      "Purple potatoes",
      "Blueberries",
      "Blackberries",
    ],
  },
  {
    color: "White",
    bgGradient: "from-zinc-300/15 to-zinc-300/5",
    borderColor: "border-zinc-400/30",
    dotColor: "bg-zinc-400",
    textColor: "text-zinc-300",
    phytonutrient: "Allicin & Quercetin",
    benefit: "Immune support, anti-microbial, blood pressure",
    vegetables: [
      "Garlic",
      "Onions",
      "Cauliflower",
      "Mushrooms",
      "Parsnips",
      "White beans",
    ],
  },
] as const;

// ─── Component ──────────────────────────────────────

export function VeggieRainbow() {
  return (
    <div className="space-y-4">
      {/* Intro text */}
      <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Aim to eat a variety of colours every day. Each colour group provides
          unique phytonutrients that support different aspects of your health.
          The more colours on your plate, the broader your nutritional coverage.
        </p>
      </div>

      {/* Rainbow grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RAINBOW_GROUPS.map((group) => (
          <Card
            key={group.color}
            className={cn(
              "overflow-hidden border-border/50 transition-all hover:border-border hover:shadow-md",
              group.borderColor
            )}
          >
            {/* Colored header strip */}
            <div className={cn("bg-gradient-to-r px-4 py-3", group.bgGradient)}>
              <div className="flex items-center gap-2.5">
                <div
                  className={cn("h-4 w-4 rounded-full shadow-sm", group.dotColor)}
                />
                <h4 className={cn("text-sm font-bold", group.textColor)}>
                  {group.color}
                </h4>
              </div>
            </div>

            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.phytonutrient}
              </CardTitle>
              <p className="text-xs text-muted-foreground/80">
                {group.benefit}
              </p>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="flex flex-wrap gap-1.5">
                {group.vegetables.map((veg) => (
                  <span
                    key={veg}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                      group.borderColor,
                      "bg-secondary/50 text-foreground hover:bg-secondary"
                    )}
                  >
                    {veg}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
