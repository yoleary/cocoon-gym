"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Loader2 } from "lucide-react";
import { updateProgram } from "@/actions/program.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditProgramDialogProps {
  programId: string;
  currentName: string;
  currentDescription: string | null;
  currentWeeks: number;
}

export function EditProgramDialog({
  programId,
  currentName,
  currentDescription,
  currentWeeks,
}: EditProgramDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? "");
  const [weeks, setWeeks] = useState(currentWeeks);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await updateProgram(programId, {
        name: name.trim(),
        description: description.trim() || null,
        weeks,
      });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message ?? "Failed to update program");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1.5" />
          Edit Program
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
          <DialogDescription>
            Update the program name, description, or duration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Program Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Beginner Strength 6-Week"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the program..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeks">Duration (weeks)</Label>
            <Input
              id="weeks"
              type="number"
              min={1}
              max={52}
              value={weeks}
              onChange={(e) => setWeeks(parseInt(e.target.value) || 6)}
              className="w-24"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
