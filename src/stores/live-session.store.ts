"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LiveExercise, LiveSessionState, LiveSet, SetType } from "@/types";

// ─── Actions ─────────────────────────────────────

interface LiveSessionActions {
  /** Bootstrap a new workout session with exercises from the template */
  initSession: (payload: {
    sessionId: string;
    templateId: string | null;
    templateName: string | null;
    weekNumber: number | null;
    progressionType: string | null;
    totalWeeks: number | null;
    exercises: LiveExercise[];
  }) => void;

  /** Jump to a specific exercise by index */
  setCurrentExercise: (index: number) => void;

  /** Update a single field on an existing set */
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    data: Partial<Pick<LiveSet, "weight" | "reps" | "rpe" | "durationSeconds" | "setType">>
  ) => void;

  /** Append a new empty set to an exercise */
  addSet: (exerciseIndex: number, setType?: SetType) => void;

  /** Mark a set as completed (or toggle it back) */
  completeSet: (exerciseIndex: number, setIndex: number) => void;

  /** Start rest countdown for the current exercise */
  startRest: (seconds: number) => void;

  /** Decrement the rest timer by 1 second (called every second) */
  tickRest: () => void;

  /** Cancel rest early */
  stopRest: () => void;

  /** Add or subtract time from the running rest timer */
  adjustRestTime: (delta: number) => void;

  /** Pause / resume the whole session */
  togglePause: () => void;

  /** Wipe session state (after finishing or discarding) */
  clearSession: () => void;
}

// ─── Combined store type ─────────────────────────

type LiveSessionStore = LiveSessionState & LiveSessionActions;

// ─── Default state ───────────────────────────────

const defaultState: LiveSessionState = {
  sessionId: "",
  templateId: null,
  templateName: null,
  weekNumber: null,
  progressionType: null,
  totalWeeks: null,
  currentExerciseIndex: 0,
  exercises: [],
  isResting: false,
  restTimeRemaining: 0,
  sessionStartedAt: "",
  isPaused: false,
};

// ─── Store ───────────────────────────────────────

export const useLiveSessionStore = create<LiveSessionStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ── Init ──────────────────────────────────

      initSession: ({ sessionId, templateId, templateName, weekNumber, progressionType, totalWeeks, exercises }) => {
        set({
          sessionId,
          templateId,
          templateName,
          weekNumber,
          progressionType: progressionType as any,
          totalWeeks,
          exercises,
          currentExerciseIndex: 0,
          isResting: false,
          restTimeRemaining: 0,
          sessionStartedAt: new Date().toISOString(),
          isPaused: false,
        });
      },

      // ── Navigation ────────────────────────────

      setCurrentExercise: (index) => {
        const { exercises } = get();
        if (index >= 0 && index < exercises.length) {
          set({ currentExerciseIndex: index });
        }
      },

      // ── Set mutations ─────────────────────────

      updateSet: (exerciseIndex, setIndex, data) => {
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];
          sets[setIndex] = { ...sets[setIndex], ...data };
          exercise.sets = sets;
          exercises[exerciseIndex] = exercise;
          return { exercises };
        });
      },

      addSet: (exerciseIndex, setType) => {
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];
          const newSet: LiveSet = {
            setNumber: sets.length + 1,
            setType: setType ?? "WORKING",
            weight: null,
            reps: null,
            durationSeconds: null,
            rpe: null,
            completed: false,
          };
          sets.push(newSet);
          exercise.sets = sets;
          exercises[exerciseIndex] = exercise;
          return { exercises };
        });
      },

      completeSet: (exerciseIndex, setIndex) => {
        set((state) => {
          const exercises = [...state.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];
          sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed };
          exercise.sets = sets;
          exercises[exerciseIndex] = exercise;
          return { exercises };
        });
      },

      // ── Rest timer ────────────────────────────

      startRest: (seconds) => {
        set({ isResting: true, restTimeRemaining: seconds });
      },

      tickRest: () => {
        const { restTimeRemaining } = get();
        if (restTimeRemaining <= 1) {
          set({ isResting: false, restTimeRemaining: 0 });
        } else {
          set({ restTimeRemaining: restTimeRemaining - 1 });
        }
      },

      stopRest: () => {
        set({ isResting: false, restTimeRemaining: 0 });
      },

      adjustRestTime: (delta) => {
        set((state) => ({
          restTimeRemaining: Math.max(0, state.restTimeRemaining + delta),
        }));
      },

      // ── Session controls ──────────────────────

      togglePause: () => {
        set((state) => ({ isPaused: !state.isPaused }));
      },

      clearSession: () => {
        set({ ...defaultState });
      },
    }),
    {
      name: "cocoon-live-session",
      // Only persist a subset of fields that should survive a page reload
      partialize: (state) => ({
        sessionId: state.sessionId,
        templateId: state.templateId,
        templateName: state.templateName,
        weekNumber: state.weekNumber,
        progressionType: state.progressionType,
        totalWeeks: state.totalWeeks,
        currentExerciseIndex: state.currentExerciseIndex,
        exercises: state.exercises,
        sessionStartedAt: state.sessionStartedAt,
        isPaused: state.isPaused,
        // Intentionally exclude transient timer state:
        // isResting, restTimeRemaining
      }),
    }
  )
);
