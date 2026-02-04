"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleMinus, CircleX } from "lucide-react";

// ─── Types ──────────────────────────────────────────

interface FoodSpectrumProps {
  type: "protein" | "carb" | "fat";
}

type Category = "eat-more" | "eat-some" | "eat-less";

interface FoodCategory {
  category: Category;
  label: string;
  icon: typeof CircleCheck;
  headerColor: string;
  badgeColor: string;
  borderColor: string;
  items: string[];
}

// ─── Spectrum Data ──────────────────────────────────

const SPECTRUM_DATA: Record<FoodSpectrumProps["type"], FoodCategory[]> = {
  protein: [
    {
      category: "eat-more",
      label: "Eat More",
      icon: CircleCheck,
      headerColor: "text-green-500",
      badgeColor: "bg-green-500/10 text-green-400",
      borderColor: "border-green-500/30",
      items: [
        "Chicken breast",
        "Turkey breast",
        "White fish (cod, tilapia)",
        "Egg whites",
        "Greek yoghurt (0% fat)",
        "Cottage cheese (low fat)",
        "Prawns and shrimp",
        "Bison / venison",
      ],
    },
    {
      category: "eat-some",
      label: "Eat Some",
      icon: CircleMinus,
      headerColor: "text-amber-500",
      badgeColor: "bg-amber-500/10 text-amber-400",
      borderColor: "border-amber-500/30",
      items: [
        "Salmon",
        "Lean beef mince",
        "Whole eggs",
        "Pork tenderloin",
        "Tofu and tempeh",
        "Tinned tuna",
        "Protein powder",
        "Edamame beans",
      ],
    },
    {
      category: "eat-less",
      label: "Eat Less",
      icon: CircleX,
      headerColor: "text-red-500",
      badgeColor: "bg-red-500/10 text-red-400",
      borderColor: "border-red-500/30",
      items: [
        "Fried chicken",
        "Processed deli meats",
        "Hot dogs and sausages",
        "Breaded fish fingers",
        "Fatty beef burgers",
        "Bacon (regular)",
        "Battered fish",
        "Processed protein bars",
      ],
    },
  ],
  carb: [
    {
      category: "eat-more",
      label: "Eat More",
      icon: CircleCheck,
      headerColor: "text-green-500",
      badgeColor: "bg-green-500/10 text-green-400",
      borderColor: "border-green-500/30",
      items: [
        "Sweet potatoes",
        "Oats (rolled or steel-cut)",
        "Brown rice",
        "Quinoa",
        "Whole grain bread",
        "Lentils and chickpeas",
        "Beans (kidney, black)",
        "Berries (all kinds)",
      ],
    },
    {
      category: "eat-some",
      label: "Eat Some",
      icon: CircleMinus,
      headerColor: "text-amber-500",
      badgeColor: "bg-amber-500/10 text-amber-400",
      borderColor: "border-amber-500/30",
      items: [
        "White rice",
        "Sourdough bread",
        "Pasta (whole wheat)",
        "Bananas",
        "White potatoes",
        "Couscous",
        "Rye crackers",
        "Dried fruit (small portions)",
      ],
    },
    {
      category: "eat-less",
      label: "Eat Less",
      icon: CircleX,
      headerColor: "text-red-500",
      badgeColor: "bg-red-500/10 text-red-400",
      borderColor: "border-red-500/30",
      items: [
        "White bread",
        "Sugary cereals",
        "Pastries and croissants",
        "Crisps and chips",
        "Sweets and candy",
        "Fruit juice",
        "Energy drinks",
        "Biscuits and cookies",
      ],
    },
  ],
  fat: [
    {
      category: "eat-more",
      label: "Eat More",
      icon: CircleCheck,
      headerColor: "text-green-500",
      badgeColor: "bg-green-500/10 text-green-400",
      borderColor: "border-green-500/30",
      items: [
        "Avocado",
        "Extra virgin olive oil",
        "Nuts (almonds, walnuts)",
        "Seeds (chia, flax, pumpkin)",
        "Fatty fish (salmon, mackerel)",
        "Natural nut butters",
        "Olives",
        "Coconut oil (small amounts)",
      ],
    },
    {
      category: "eat-some",
      label: "Eat Some",
      icon: CircleMinus,
      headerColor: "text-amber-500",
      badgeColor: "bg-amber-500/10 text-amber-400",
      borderColor: "border-amber-500/30",
      items: [
        "Cheese (hard, aged)",
        "Butter",
        "Dark chocolate (70%+)",
        "Egg yolks",
        "Coconut milk",
        "Full-fat yoghurt",
        "Cashew nuts",
        "Pesto",
      ],
    },
    {
      category: "eat-less",
      label: "Eat Less",
      icon: CircleX,
      headerColor: "text-red-500",
      badgeColor: "bg-red-500/10 text-red-400",
      borderColor: "border-red-500/30",
      items: [
        "Deep-fried foods",
        "Margarine and spreads",
        "Processed cheese",
        "Cream-based sauces",
        "Vegetable/seed oils",
        "Packaged snack foods",
        "Mayonnaise (regular)",
        "Ice cream",
      ],
    },
  ],
};

// ─── Label map ──────────────────────────────────────

const TYPE_LABELS: Record<FoodSpectrumProps["type"], string> = {
  protein: "Protein Sources",
  carb: "Carbohydrate Sources",
  fat: "Fat Sources",
};

// ─── Component ──────────────────────────────────────

export function FoodSpectrum({ type }: FoodSpectrumProps) {
  const categories = SPECTRUM_DATA[type];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{TYPE_LABELS[type]}</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.category}
              className={cn("border-border/50 transition-colors hover:border-border", cat.borderColor)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className={cn("h-4 w-4", cat.headerColor)} />
                  <span className={cat.headerColor}>{cat.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          cat.category === "eat-more" && "bg-green-500",
                          cat.category === "eat-some" && "bg-amber-500",
                          cat.category === "eat-less" && "bg-red-500"
                        )}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
