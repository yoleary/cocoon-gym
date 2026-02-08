"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Dumbbell, ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────

interface AssignedProgram {
  name: string;
  weeks: number;
  templateCount: number;
  trainerName: string;
}

interface OnboardingWizardProps {
  userName: string;
  programs: AssignedProgram[];
}

// ─── Steps ──────────────────────────────────────

const STEPS = [
  { label: "Welcome", icon: Sparkles },
  { label: "Your Program", icon: ClipboardList },
  { label: "Get Started", icon: Dumbbell },
] as const;

// ─── Component ──────────────────────────────────

export function OnboardingWizard({ userName, programs }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const firstName = userName.split(" ")[0];
  const hasPrograms = programs.length > 0;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden">
      {/* Step indicators */}
      <div className="flex items-center gap-0 border-b border-border/50 px-6 pt-4 pb-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "text-primary"
                      : "text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Welcome */}
      {step === 0 && (
        <div>
          <CardHeader>
            <CardTitle className="text-xl">
              Welcome to Cocoon, {firstName}!
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Your trainer has set you up with a personalised training program.
              Here is how it works:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/50 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    1
                  </div>
                  <span className="text-sm font-medium">Follow Your Plan</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your trainer has built workouts with the right exercises, sets, and reps for your goals.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    2
                  </div>
                  <span className="text-sm font-medium">Log Your Sets</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  During each workout, record your weight and reps. Tap &ldquo;How to&rdquo; on any exercise if you are unsure.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    3
                  </div>
                  <span className="text-sm font-medium">Track Progress</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Watch your personal records, volume, and streaks grow over time as you stay consistent.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} className="gap-1.5">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      )}

      {/* Step 2: Your Program */}
      {step === 1 && (
        <div>
          <CardHeader>
            <CardTitle className="text-xl">Your Training Program</CardTitle>
            <CardDescription>
              {hasPrograms
                ? "Your trainer has assigned you the following:"
                : "Your trainer hasn't assigned a program yet — they'll set one up for you soon."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPrograms ? (
              <div className="space-y-3">
                {programs.map((prog, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{prog.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {prog.weeks} week{prog.weeks !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {prog.templateCount} workout{prog.templateCount !== 1 ? "s" : ""}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {prog.trainerName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <ClipboardList className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No program assigned yet. In the meantime, you can start a quick workout.
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)} className="gap-1.5">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      )}

      {/* Step 3: Get Started */}
      {step === 2 && (
        <div>
          <CardHeader>
            <CardTitle className="text-xl">Ready to Train!</CardTitle>
            <CardDescription>
              {hasPrograms
                ? "Head to your workouts to start your first session."
                : "Start a quick workout or explore the exercise library while your trainer sets things up."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="default"
                className="h-auto flex-col gap-2 py-6"
                asChild
              >
                <Link href="/portal/workouts">
                  <Dumbbell className="h-6 w-6" />
                  <span className="text-sm font-medium">
                    {hasPrograms ? "Start First Workout" : "Quick Workout"}
                  </span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-6"
                asChild
              >
                <Link href="/portal/exercises">
                  <ClipboardList className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Browse Exercises</span>
                </Link>
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
}
