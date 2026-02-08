"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { duplicateProgram } from "@/actions/program.actions";
import { Button } from "@/components/ui/button";

interface DuplicateProgramButtonProps {
  programId: string;
  programName: string;
  /** Use "icon" for compact list view, "default" for detail page */
  variant?: "icon" | "default";
}

export function DuplicateProgramButton({
  programId,
  programName,
  variant = "default",
}: DuplicateProgramButtonProps) {
  const router = useRouter();
  const [duplicating, setDuplicating] = useState(false);

  const handleDuplicate = async (e: React.MouseEvent) => {
    // Prevent navigating to the program detail page when clicking in the list
    e.preventDefault();
    e.stopPropagation();

    setDuplicating(true);
    try {
      const result = await duplicateProgram(programId);
      router.push(`/portal/admin/programs/${result.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to duplicate program");
      setDuplicating(false);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={handleDuplicate}
        disabled={duplicating}
        title={`Duplicate ${programName}`}
      >
        {duplicating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDuplicate}
      disabled={duplicating}
    >
      {duplicating ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <Copy className="h-4 w-4 mr-1.5" />
      )}
      Duplicate
    </Button>
  );
}
