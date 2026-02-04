/**
 * Estimated 1-Rep Max calculations
 * Uses Epley for low reps (<=5) and Brzycki for higher reps
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps <= 5) {
    // Epley formula - better for low rep ranges
    return weight * (1 + 0.0333 * reps);
  }
  // Brzycki formula - better for higher rep ranges
  return weight / (1.0278 - 0.0278 * reps);
}

/**
 * Calculate volume load for a single set
 */
export function setVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Calculate total volume for an array of sets
 */
export function totalVolume(
  sets: Array<{ weight?: number | null; reps?: number | null; completed: boolean }>
): number {
  return sets.reduce((total, set) => {
    if (set.completed && set.weight && set.reps) {
      return total + set.weight * set.reps;
    }
    return total;
  }, 0);
}

/**
 * Calculate progressive overload percentage between two sessions
 */
export function progressiveOverload(
  currentVolume: number,
  previousVolume: number
): number {
  if (previousVolume === 0) return 0;
  return ((currentVolume - previousVolume) / previousVolume) * 100;
}

/**
 * Check if a set represents a new personal record
 */
export function checkForPR(
  weight: number,
  reps: number,
  currentRecords: {
    e1rm?: number;
    maxWeight?: number;
    maxRepsAtWeight?: Record<number, number>;
  }
): {
  isE1RMPR: boolean;
  isMaxWeightPR: boolean;
  isMaxRepsPR: boolean;
  newE1RM: number;
} {
  const newE1RM = calculateE1RM(weight, reps);

  return {
    isE1RMPR: !currentRecords.e1rm || newE1RM > currentRecords.e1rm,
    isMaxWeightPR: !currentRecords.maxWeight || weight > currentRecords.maxWeight,
    isMaxRepsPR:
      !!currentRecords.maxRepsAtWeight &&
      (!currentRecords.maxRepsAtWeight[weight] ||
        reps > currentRecords.maxRepsAtWeight[weight]),
    newE1RM,
  };
}

/**
 * Format e1RM for display
 */
export function formatE1RM(weight: number, reps: number): string {
  const e1rm = calculateE1RM(weight, reps);
  return `${Math.round(e1rm * 10) / 10}kg`;
}

/**
 * Calculate intensity as percentage of e1RM
 */
export function intensityPercentage(weight: number, e1rm: number): number {
  if (e1rm === 0) return 0;
  return Math.round((weight / e1rm) * 100);
}
