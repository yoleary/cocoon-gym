"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProgram } from "@/actions/program.actions";
import type { ProgressionType } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const PROGRESSION_OPTIONS: Array<{
  value: ProgressionType;
  label: string;
  description: string;
}> = [
  { value: "NONE", label: "None", description: "No auto-progression" },
  {
    value: "STRENGTH",
    label: "Strength",
    description: "Fewer reps, heavier weight, longer rest",
  },
  {
    value: "HYPERTROPHY",
    label: "Hypertrophy",
    description: "Volume focus, +1 set after halfway",
  },
  {
    value: "ENDURANCE",
    label: "Endurance",
    description: "More reps, shorter rest",
  },
  {
    value: "LINEAR",
    label: "Linear",
    description: "+2.5% weight per week",
  },
];

interface ProgressionTypeSelectorProps {
  programId: string;
  currentType: ProgressionType;
}

export function ProgressionTypeSelector({
  programId,
  currentType,
}: ProgressionTypeSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    startTransition(async () => {
      await updateProgram(programId, {
        progressionType: value as ProgressionType,
      });
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue={currentType} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Progression type" />
        </SelectTrigger>
        <SelectContent>
          {PROGRESSION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              <div>
                <span className="font-medium">{opt.label}</span>
                <span className="ml-1.5 text-muted-foreground">
                  — {opt.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
    </div>
  );
}
