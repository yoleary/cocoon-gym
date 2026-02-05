"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserMinus } from "lucide-react";
import { unassignProgram } from "@/actions/program.actions";
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

interface UnassignProgramButtonProps {
  assignmentId: string;
  clientName: string;
  programName: string;
}

export function UnassignProgramButton({
  assignmentId,
  clientName,
  programName,
}: UnassignProgramButtonProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  const handleUnassign = async () => {
    setRemoving(true);
    try {
      await unassignProgram(assignmentId);
      router.refresh();
    } catch (err: any) {
      alert(err.message ?? "Failed to remove assignment");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <UserMinus className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from program?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove <strong>{clientName}</strong> from{" "}
            <strong>{programName}</strong>. Their workout history will be
            preserved, but they will no longer see this program in their
            workouts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnassign}
            disabled={removing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {removing && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
