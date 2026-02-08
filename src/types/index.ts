import type {
  UserRole,
  SetType,
  BodyRegion,
  MovementPattern,
  MuscleRole,
  RecordType,
  AchievementTier,
  ProgressionType,
} from "@prisma/client";

// Re-export Prisma enums for convenience
export type {
  UserRole,
  SetType,
  BodyRegion,
  MovementPattern,
  MuscleRole,
  RecordType,
  AchievementTier,
  ProgressionType,
};

// ─── Auth Types ───────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

// ─── Live Session Types ───────────────────────────

export interface LiveSet {
  id?: string;
  setNumber: number;
  setType: SetType;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  rpe: number | null;
  completed: boolean;
}

export interface PreviousPerformance {
  sets: Array<{
    weight: number | null;
    reps: number | null;
    setType: SetType;
  }>;
  bestE1RM: number | null;
}

export interface LiveExercise {
  sessionExerciseId?: string;
  exerciseId: string;
  name: string;
  position: string;
  targetSets: number;
  targetReps: string;
  targetWeight: string;
  tempo: string | null;
  restSeconds: number;
  notes: string | null;
  videoUrl: string | null;
  isSuperset: boolean;
  supersetGroupLabel: string | null;
  sets: LiveSet[];
  previous: PreviousPerformance | null;
  progressionNote: string | null;
  suggestedWeightChange: string | null;
  targetWeightKg: number | null;
  targetRpe: string | null;
}

export interface LiveSessionState {
  sessionId: string;
  templateId: string | null;
  templateName: string | null;
  weekNumber: number | null;
  progressionType: ProgressionType | null;
  totalWeeks: number | null;
  currentExerciseIndex: number;
  exercises: LiveExercise[];
  isResting: boolean;
  restTimeRemaining: number;
  sessionStartedAt: string;
  isPaused: boolean;
}

// ─── Progress Types ───────────────────────────────

export interface PRRecord {
  exerciseName: string;
  recordType: RecordType;
  value: number;
  context: string;
  achievedAt: string;
}

export interface VolumeDataPoint {
  date: string;
  volume: number;
  label?: string;
}

export interface E1RMDataPoint {
  date: string;
  e1rm: number;
  weight: number;
  reps: number;
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface MuscleGroupVolume {
  name: string;
  volume: number;
  percentage: number;
}

// ─── Workout Types ────────────────────────────────

export interface WorkoutBlock {
  label: string;
  isSuperset: boolean;
  exercises: Array<{
    position: string;
    exerciseName: string;
    targetSets: number | null;
    targetReps: string | null;
    targetWeight: string | null;
    tempo: string | null;
    restSeconds: number | null;
    notes: string | null;
  }>;
}

export interface WorkoutTemplateView {
  id: string;
  name: string;
  blocks: WorkoutBlock[];
}

// ─── Nutrition Types ──────────────────────────────

export interface FoodItem {
  name: string;
  category: "eat-more" | "eat-some" | "eat-less";
  type: "protein" | "carb" | "fat";
}

export interface MealExample {
  time: string;
  title: string;
  items: string[];
}
