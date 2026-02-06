import { RoleGuard } from "@/components/portal/role-guard";
import { ProgramBuilder } from "./program-builder";

export default function CreateProgramPage() {
  return (
    <RoleGuard allowedRoles={["TRAINER"]}>
      <ProgramBuilder />
    </RoleGuard>
  );
}
