"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecordType } from "@/types";

// ─── Types ───────────────────────────────────────

interface PRInfo {
  exerciseName: string;
  recordType: RecordType;
  value: number;
}

const RECORD_LABELS: Record<RecordType, string> = {
  E1RM: "Est. 1RM",
  MAX_WEIGHT: "Max Weight",
  MAX_REPS_AT_WEIGHT: "Max Reps",
  MAX_VOLUME_SESSION: "Session Volume",
  MAX_DURATION: "Duration",
};

function formatPRValue(recordType: RecordType, value: number): string {
  switch (recordType) {
    case "E1RM":
    case "MAX_WEIGHT":
      return `${value}kg`;
    case "MAX_REPS_AT_WEIGHT":
      return `${value} reps`;
    case "MAX_VOLUME_SESSION":
      return `${value.toLocaleString()}kg`;
    case "MAX_DURATION":
      return `${value}s`;
    default:
      return String(value);
  }
}

// ─── Confetti particle ───────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

const CONFETTI_COLORS = [
  "#FFD700", // Gold
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Light gold
  "#DDA0DD", // Plum
  "#FF8A5C", // Orange
];

// ─── Props ───────────────────────────────────────

interface PRCelebrationProps {
  pr: PRInfo | null;
  /** Duration in ms before auto-dismiss (default 4000) */
  duration?: number;
  onDismiss?: () => void;
}

// ─── Component ───────────────────────────────────

export function PRCelebration({
  pr,
  duration = 4000,
  onDismiss,
}: PRCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrame = useRef<number | null>(null);

  // ── Generate confetti ───────────────────────

  const generateParticles = useCallback((): Particle[] => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 40,
      rotation: Math.random() * 360,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 4 + Math.random() * 6,
      velocity: {
        x: (Math.random() - 0.5) * 8,
        y: -(2 + Math.random() * 6),
      },
    }));
  }, []);

  // ── Animate particles ──────────────────────

  useEffect(() => {
    if (!visible || particles.length === 0) return;

    let frame: number;
    const gravity = 0.15;

    const animate = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.velocity.x * 0.3,
            y: p.y + p.velocity.y * 0.3,
            rotation: p.rotation + p.velocity.x * 2,
            velocity: {
              x: p.velocity.x * 0.99,
              y: p.velocity.y + gravity,
            },
          }))
          .filter((p) => p.y < 120) // Remove particles that fall below viewport
      );
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    animationFrame.current = frame;

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [visible, particles.length]);

  // ── Show / auto-dismiss ────────────────────

  useEffect(() => {
    if (!pr) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setParticles(generateParticles());

    dismissTimer.current = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [pr, duration, generateParticles, onDismiss]);

  // ── Render ──────────────────────────────────

  if (!visible || !pr) return null;

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
      aria-live="polite"
      role="status"
    >
      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg)`,
              opacity: Math.max(0, 1 - p.y / 120),
            }}
          />
        ))}
      </div>

      {/* Banner */}
      <div
        className={cn(
          "relative pointer-events-auto rounded-2xl border bg-background/95 backdrop-blur-sm px-8 py-6 shadow-2xl text-center",
          "animate-in zoom-in-95 fade-in duration-300"
        )}
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-7 w-7 text-amber-500" />
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            NEW PR!
          </span>
          <Trophy className="h-7 w-7 text-amber-500" />
        </div>

        <p className="text-sm font-medium">{pr.exerciseName}</p>

        <p className="mt-1 text-lg font-bold tabular-nums">
          {RECORD_LABELS[pr.recordType]}: {formatPRValue(pr.recordType, pr.value)}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Tap to dismiss
        </p>
      </div>
    </div>
  );
}
