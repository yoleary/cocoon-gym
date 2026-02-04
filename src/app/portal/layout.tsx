import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { BottomNav } from "@/components/portal/bottom-nav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: ((session.user as any).role as string) ?? "CLIENT",
    image: session.user.image ?? null,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <PortalSidebar user={user} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-20 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav userRole={user.role} />
    </div>
  );
}
