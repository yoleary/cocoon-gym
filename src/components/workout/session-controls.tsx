"use client";

import { useEffect, useState, useCallback } from "react";
import { Pause, Play, Square, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDuration } from "@/lib/utils";

// ─── Props ───────────────────────────────────────

interface SessionControlsProps {
  /** ISO timestamp when the session started */
  sessionStartedAt: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onFinish: () => void;
  onAbandon?: () => void;
}

// ─── Component ───────────────────────────────────

export function SessionControls({
  sessionStartedAt,
  isPaused,
  onTogglePause,
  onFinish,
  onAbandon,
}: SessionControlsProps) {
  const [elapsed, setElapsed] = useState(0);

  // ── Elapsed time ticker ─────────────────────

  useEffect(() => {
    if (!sessionStartedAt) return;

    const calculateElapsed = () => {
      const start = new Date(sessionStartedAt).getTime();
      return Math.floor((Date.now() - start) / 1000);
    };

    // Set initial value immediately
    setElapsed(calculateElapsed());

    if (isPaused) return;

    const id = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1_000);

    return () => clearInterval(id);
  }, [sessionStartedAt, isPaused]);

  // ── Render ──────────────────────────────────

  return (
    <div className="flex items-center gap-2">
      {/* Elapsed timer */}
      <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-3 py-1.5">
        <Timer className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm font-medium tabular-nums">
          {formatDuration(elapsed)}
        </span>
      </div>

      {/* Pause / Resume */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 touch-manipulation"
        onClick={onTogglePause}
        aria-label={isPaused ? "Resume session" : "Pause session"}
      >
        {isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
      </Button>

      {/* Abandon workout (with confirmation) */}
      {onAbandon && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 touch-manipulation text-muted-foreground hover:text-destructive hover:border-destructive"
              aria-label="Abandon workout"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="sm:max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Abandon Workout?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this workout session and all logged
                sets. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel>Keep Going</AlertDialogCancel>
              <AlertDialogAction
                onClick={onAbandon}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Abandon Workout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Finish workout (with confirmation) */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 touch-manipulation"
          >
            <Square className="h-3.5 w-3.5" />
            Finish
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Finish Workout?</DialogTitle>
            <DialogDescription>
              This will end your current session and save all logged sets.
              You can review your results in your workout history.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Keep Going</Button>
            </DialogClose>
            <Button variant="destructive" onClick={onFinish}>
              Finish Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
