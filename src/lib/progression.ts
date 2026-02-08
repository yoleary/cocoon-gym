import type { ProgressionType } from "@prisma/client";

// ─── Rep range parsing ───────────────────────────

export function parseRepRange(reps: string): { low: number; high: number } {
  const trimmed = reps.trim();

  // Handle range: "8-12"
  if (trimmed.includes("-")) {
    const [lo, hi] = trimmed.split("-").map(Number);
    return { low: lo || 8, high: hi || 12 };
  }

  // Handle single number: "10"
  const n = parseInt(trimmed, 10);
  if (!isNaN(n)) {
    return { low: n, high: n };
  }

  return { low: 8, high: 12 };
}

export function formatRepRange(low: number, high: number): string {
  if (low === high) return String(low);
  return `${low}-${high}`;
}

// ─── Week calculation ────────────────────────────

export function calculateWeekNumber(
  startDate: Date | string,
  totalWeeks: number
): number {
  const start = new Date(startDate);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceStart = Math.floor(
    (now.getTime() - start.getTime()) / msPerWeek
  );
  // Week 1 is the first week (0-indexed elapsed → 1-indexed week)
  const week = weeksSinceStart + 1;
  return Math.max(1, Math.min(week, totalWeeks));
}

// ─── Progression result type ─────────────────────

export interface ProgressionResult {
  targetSets: number;
  targetReps: string;
  targetWeight: string;
  restSeconds: number;
  progressionNote: string;
  /** Absolute target weight in kg if baseline exists */
  targetWeightKg: number | null;
  /** Relative change description (e.g. "+5%") if no baseline */
  suggestedWeightChange: string | null;
  /** Suggested RPE range for this week/progression (e.g. "7-8") */
  targetRpe: string | null;
}

// ─── Round to nearest 2.5 ───────────────────────

function roundTo2_5(value: number): number {
  return Math.round(value / 2.5) * 2.5;
}

// ─── Core progression logic ──────────────────────

export function applyProgression(
  base: {
    targetSets: number;
    targetReps: string;
    targetWeight: string;
    restSeconds: number;
  },
  weekNumber: number,
  progressionType: ProgressionType,
  totalWeeks: number,
  startingWeight?: number | null
): ProgressionResult {
  const { low, high } = parseRepRange(base.targetReps);
  const weeksElapsed = weekNumber - 1; // 0-indexed for multiplier calculations
  const halfwayWeek = Math.ceil(totalWeeks / 2);

  // Default — just pass through base values (NONE)
  let sets = base.targetSets;
  let repsLow = low;
  let repsHigh = high;
  let rest = base.restSeconds;
  let note = "";
  let absoluteWeight: number | null = null;
  let relativeChange: string | null = null;

  if (progressionType === "NONE") {
    return {
      targetSets: sets,
      targetReps: formatRepRange(repsLow, repsHigh),
      targetWeight: base.targetWeight,
      restSeconds: rest,
      progressionNote: "",
      targetWeightKg: null,
      suggestedWeightChange: null,
      targetRpe: null,
    };
  }

  // ── Weight progression (shared by STRENGTH, HYPERTROPHY, LINEAR) ──
  const weightIncreasePerWeek = 0.025; // 2.5%

  if (
    progressionType === "STRENGTH" ||
    progressionType === "HYPERTROPHY" ||
    progressionType === "LINEAR"
  ) {
    const multiplier = 1 + weightIncreasePerWeek * weeksElapsed;

    if (startingWeight != null && startingWeight > 0) {
      absoluteWeight = roundTo2_5(startingWeight * multiplier);
    } else {
      const totalPercent = +(weightIncreasePerWeek * weeksElapsed * 100).toFixed(1);
      relativeChange = totalPercent > 0 ? `+${totalPercent}%` : null;
    }
  }

  // ── Type-specific adjustments ──

  switch (progressionType) {
    case "STRENGTH": {
      // Reps decrease over weeks (e.g. 8 → 4)
      const repDrop = Math.round(
        ((high - 4) / Math.max(totalWeeks - 1, 1)) * weeksElapsed
      );
      repsLow = Math.max(4, low - repDrop);
      repsHigh = Math.max(4, high - repDrop);

      // Rest increases by 15s every 2 weeks
      const restBumps = Math.floor(weeksElapsed / 2);
      rest = base.restSeconds + restBumps * 15;

      note =
        weekNumber === 1
          ? "Base week"
          : `Wk ${weekNumber}: heavier weight, fewer reps`;
      break;
    }

    case "HYPERTROPHY": {
      // Reps stay in base range (8-15 typical)
      // Sets increase by 1 after halfway point
      if (weekNumber > halfwayWeek) {
        sets = base.targetSets + 1;
      }

      note =
        weekNumber <= halfwayWeek
          ? `Wk ${weekNumber}: building volume`
          : `Wk ${weekNumber}: +1 set, pushing intensity`;
      break;
    }

    case "ENDURANCE": {
      // Reps increase over weeks (e.g. 12 → 18)
      const repGain = Math.round(
        (6 / Math.max(totalWeeks - 1, 1)) * weeksElapsed
      );
      repsLow = low + repGain;
      repsHigh = high + repGain;

      // Weight stays same or slight increase (no multiplier applied above for endurance)
      absoluteWeight = null;
      relativeChange = null;

      // Slight weight increase: 1% per week if baseline
      if (startingWeight != null && startingWeight > 0) {
        absoluteWeight = roundTo2_5(
          startingWeight * (1 + 0.01 * weeksElapsed)
        );
      }

      // Rest decreases over weeks
      const restDecrease = Math.round(
        (30 / Math.max(totalWeeks - 1, 1)) * weeksElapsed
      );
      rest = Math.max(30, base.restSeconds - restDecrease);

      note =
        weekNumber === 1
          ? "Base week"
          : `Wk ${weekNumber}: more reps, shorter rest`;
      break;
    }

    case "LINEAR": {
      // Reps and sets stay the same, only weight increases
      note =
        weekNumber === 1
          ? "Base week"
          : `Wk ${weekNumber}: +${(weightIncreasePerWeek * weeksElapsed * 100).toFixed(1)}% weight`;
      break;
    }
  }

  // ── RPE guidance based on progression type and week ──
  let targetRpe: string | null = null;
  const progressFraction = totalWeeks > 1 ? weeksElapsed / (totalWeeks - 1) : 0;

  switch (progressionType) {
    case "STRENGTH":
      // RPE climbs from 7 to 9-10 across the program
      targetRpe = progressFraction < 0.33 ? "7-8" : progressFraction < 0.66 ? "8-9" : "9-10";
      break;
    case "HYPERTROPHY":
      // Moderate RPE throughout, slight increase in later weeks
      targetRpe = weekNumber <= halfwayWeek ? "7-8" : "8-9";
      break;
    case "ENDURANCE":
      // Lower RPE, sustained effort
      targetRpe = progressFraction < 0.5 ? "6-7" : "7-8";
      break;
    case "LINEAR":
      // Steady climb
      targetRpe = progressFraction < 0.5 ? "7-8" : "8-9";
      break;
  }

  // Build the display weight string
  let displayWeight = base.targetWeight;
  if (absoluteWeight != null) {
    displayWeight = `${absoluteWeight} kg`;
  } else if (relativeChange) {
    displayWeight = base.targetWeight
      ? `${base.targetWeight} (${relativeChange})`
      : relativeChange;
  }

  return {
    targetSets: sets,
    targetReps: formatRepRange(repsLow, repsHigh),
    targetWeight: displayWeight,
    restSeconds: rest,
    progressionNote: note,
    targetWeightKg: absoluteWeight,
    suggestedWeightChange: relativeChange,
    targetRpe,
  };
}

// ─── Preview helper: generate all weeks at once ──

export function generateProgressionPreview(
  base: {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: string;
    targetWeight: string;
    restSeconds: number;
  },
  progressionType: ProgressionType,
  totalWeeks: number,
  startingWeight?: number | null
): Array<{
  week: number;
  targetSets: number;
  targetReps: string;
  targetWeight: string;
  restSeconds: number;
  progressionNote: string;
}> {
  return Array.from({ length: totalWeeks }, (_, i) => {
    const week = i + 1;
    const result = applyProgression(
      base,
      week,
      progressionType,
      totalWeeks,
      startingWeight
    );
    return {
      week,
      targetSets: result.targetSets,
      targetReps: result.targetReps,
      targetWeight: result.targetWeight,
      restSeconds: result.restSeconds,
      progressionNote: result.progressionNote,
    };
  });
}
