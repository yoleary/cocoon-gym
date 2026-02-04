export interface Tempo {
  lowering: number;
  pauseBottom: number;
  lifting: number;
  pauseTop: number;
}

/**
 * Parse a tempo string like "2111" into components
 */
export function parseTempo(tempo: string): Tempo | null {
  if (!tempo || tempo.length !== 4) return null;
  const digits = tempo.split("").map(Number);
  if (digits.some(isNaN)) return null;

  return {
    lowering: digits[0],
    pauseBottom: digits[1],
    lifting: digits[2],
    pauseTop: digits[3],
  };
}

/**
 * Format a Tempo object back to string
 */
export function formatTempo(tempo: Tempo): string {
  return `${tempo.lowering}${tempo.pauseBottom}${tempo.lifting}${tempo.pauseTop}`;
}

/**
 * Get a human-readable description of the tempo
 */
export function tempoDescription(tempo: Tempo): string {
  const parts: string[] = [];
  parts.push(`${tempo.lowering}s down`);
  if (tempo.pauseBottom > 0) parts.push(`${tempo.pauseBottom}s pause`);
  parts.push(`${tempo.lifting}s up`);
  if (tempo.pauseTop > 0) parts.push(`${tempo.pauseTop}s hold`);
  return parts.join(" → ");
}

/**
 * Calculate total time per rep from tempo
 */
export function tempoRepDuration(tempo: Tempo): number {
  return tempo.lowering + tempo.pauseBottom + tempo.lifting + tempo.pauseTop;
}
