import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footprints, Droplets, Moon } from "lucide-react";

// ─── Data ───────────────────────────────────────────

const FOUNDATIONS = [
  {
    icon: Footprints,
    title: "Daily Steps",
    target: "8,000 - 10,000",
    unit: "steps",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description:
      "Walking is the foundation of an active lifestyle. Aim for 8-10k steps daily. Take the stairs, walk to the shops, and get outside during lunch. Every step counts toward your health and recovery.",
  },
  {
    icon: Droplets,
    title: "Water Intake",
    target: "2 - 3",
    unit: "litres",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    description:
      "Stay hydrated throughout the day. Keep a water bottle with you and sip consistently. Increase intake on training days and during warm weather. Herbal teas count too.",
  },
  {
    icon: Moon,
    title: "Quality Sleep",
    target: "7 - 8",
    unit: "hours",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description:
      "Sleep is when your body repairs and grows. Prioritize a consistent sleep schedule, limit screens before bed, and keep your room cool and dark. Recovery happens while you rest.",
  },
] as const;

// ─── Component ──────────────────────────────────────

export function DailyFoundations() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {FOUNDATIONS.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.title}
            className="border-border/50 transition-colors hover:border-border"
          >
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tabular-nums tracking-tight">
                    {item.target}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.unit}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
