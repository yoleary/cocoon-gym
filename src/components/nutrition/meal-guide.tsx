import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sun, UtensilsCrossed, Sunset, Cookie } from "lucide-react";

// ─── Data ───────────────────────────────────────────

const MEALS = [
  {
    icon: Sun,
    title: "Breakfast",
    time: "7:00 - 9:00",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    items: [
      {
        name: "Greek yoghurt with berries and granola",
        protein: "20g protein",
      },
      {
        name: "Scrambled eggs on whole grain bread with avocado",
        protein: "25g protein",
      },
      {
        name: "Overnight oats with banana, peanut butter and chia seeds",
        protein: "18g protein",
      },
      {
        name: "Smoked salmon on rye with cream cheese",
        protein: "22g protein",
      },
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Lunch",
    time: "12:00 - 14:00",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    items: [
      {
        name: "Grilled chicken salad with quinoa and mixed vegetables",
        protein: "35g protein",
      },
      {
        name: "Tuna wrap with hummus, spinach and peppers",
        protein: "30g protein",
      },
      {
        name: "Lentil soup with whole grain bread and feta",
        protein: "22g protein",
      },
      {
        name: "Turkey and avocado sandwich on sourdough",
        protein: "28g protein",
      },
    ],
  },
  {
    icon: Sunset,
    title: "Dinner",
    time: "18:00 - 20:00",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    items: [
      {
        name: "Salmon fillet with sweet potato and roasted broccoli",
        protein: "38g protein",
      },
      {
        name: "Lean steak with roasted vegetables and brown rice",
        protein: "42g protein",
      },
      {
        name: "Chicken stir-fry with vegetables and noodles",
        protein: "35g protein",
      },
      {
        name: "Cod with stamppot and sauteed green beans",
        protein: "32g protein",
      },
    ],
  },
  {
    icon: Cookie,
    title: "Snacks",
    time: "Between meals",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    items: [
      {
        name: "Apple with almond butter",
        protein: "7g protein",
      },
      {
        name: "Cottage cheese with walnuts and honey",
        protein: "15g protein",
      },
      {
        name: "Protein shake with banana post-workout",
        protein: "25g protein",
      },
      {
        name: "Handful of mixed nuts and dark chocolate",
        protein: "8g protein",
      },
    ],
  },
] as const;

// ─── Component ──────────────────────────────────────

export function MealGuide() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {MEALS.map((meal) => {
        const Icon = meal.icon;
        return (
          <Card
            key={meal.title}
            className="border-border/50 transition-colors hover:border-border"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meal.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${meal.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{meal.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{meal.time}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {meal.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="text-sm leading-snug text-foreground">
                      {item.name}
                    </span>
                    <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
                      {item.protein}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
