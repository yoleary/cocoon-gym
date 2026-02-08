"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Check, MessageSquare, Pencil, Loader2 } from "lucide-react";
import {
  getClientProgramExercises,
  saveClientExerciseNote,
} from "@/actions/client-notes.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClientExerciseNotesProps {
  clientId: string;
}

interface ProgramExercises {
  programId: string;
  programName: string;
  exercises: Array<{ id: string; name: string }>;
}

export function ClientExerciseNotes({ clientId }: ClientExerciseNotesProps) {
  const [programs, setPrograms] = useState<ProgramExercises[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    getClientProgramExercises(clientId)
      .then(({ programs: p, notes: n }) => {
        setPrograms(p);
        setNotes(n);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  const startEdit = useCallback(
    (exerciseId: string) => {
      setEditingId(exerciseId);
      setEditValue(notes[exerciseId] ?? "");
    },
    [notes]
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const handleSave = useCallback(
    (exerciseId: string) => {
      startSaving(async () => {
        await saveClientExerciseNote(clientId, exerciseId, editValue);
        setNotes((prev) => {
          const next = { ...prev };
          if (editValue.trim()) {
            next[exerciseId] = editValue.trim();
          } else {
            delete next[exerciseId];
          }
          return next;
        });
        setEditingId(null);
        setEditValue("");
      });
    },
    [clientId, editValue]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading exercises...
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No active programs. Assign a program to add exercise notes.
      </p>
    );
  }

  const notesCount = Object.keys(notes).length;

  return (
    <div className="space-y-4">
      {notesCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {notesCount} exercise {notesCount === 1 ? "note" : "notes"} saved
        </p>
      )}

      {programs.map((program) => (
        <div key={program.programId} className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            {program.programName}
          </h4>
          <div className="space-y-1.5">
            {program.exercises.map((exercise) => {
              const isEditing = editingId === exercise.id;
              const hasNote = !!notes[exercise.id];

              return (
                <div
                  key={exercise.id}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    isEditing
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {exercise.name}
                      </span>
                      {hasNote && !isEditing && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] shrink-0"
                        >
                          <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                          Note
                        </Badge>
                      )}
                    </div>
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs shrink-0"
                        onClick={() => startEdit(exercise.id)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        {hasNote ? "Edit" : "Add note"}
                      </Button>
                    )}
                  </div>

                  {/* Show existing note when not editing */}
                  {hasNote && !isEditing && (
                    <p className="mt-1.5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {notes[exercise.id]}
                    </p>
                  )}

                  {/* Editing state */}
                  {isEditing && (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Add a note for this client on this exercise... (e.g. form cues, modifications, injury considerations)"
                        className="min-h-[80px] text-sm resize-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleSave(exercise.id)}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
