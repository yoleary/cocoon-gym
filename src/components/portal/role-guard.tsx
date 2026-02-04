import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export async function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role as string | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect("/portal/dashboard");
  }

  return <>{children}</>;
}
