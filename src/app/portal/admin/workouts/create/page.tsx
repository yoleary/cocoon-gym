import { RoleGuard } from "@/components/portal/role-guard";
import { WorkoutBuilder } from "./workout-builder";

export default function CreateWorkoutPage() {
  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <WorkoutBuilder />
    </RoleGuard>
  );
}
