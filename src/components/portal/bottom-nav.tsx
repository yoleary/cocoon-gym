"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  History,
  TrendingUp,
  MoreHorizontal,
  Library,
  Apple,
  Users,
  BookOpen,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  userRole?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const primaryTabs: NavItem[] = [
  { label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/portal/workouts", icon: Dumbbell },
  { label: "History", href: "/portal/history", icon: History },
  { label: "Progress", href: "/portal/progress", icon: TrendingUp },
];

const moreItems: NavItem[] = [
  { label: "Exercises", href: "/portal/exercises", icon: Library },
  { label: "Nutrition", href: "/portal/nutrition", icon: Apple },
];

const adminItems: NavItem[] = [
  { label: "Clients", href: "/portal/admin/clients", icon: Users },
  { label: "Programs", href: "/portal/admin/programs", icon: BookOpen },
  {
    label: "Manage Exercises",
    href: "/portal/admin/exercises",
    icon: Settings,
  },
];

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isTrainer = userRole === "TRAINER";

  function isActive(href: string): boolean {
    if (href === "/portal/dashboard") {
      return pathname === "/portal/dashboard" || pathname === "/portal";
    }
    return pathname.startsWith(href);
  }

  const isMoreActive =
    [...moreItems, ...adminItems].some((item) =>
      pathname.startsWith(item.href)
    );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card md:hidden">
      {/* Safe area padding for iOS notch/home indicator */}
      <nav className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {primaryTabs.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* More Button - opens sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors",
                isMoreActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <MoreHorizontal
                className={cn(
                  "h-5 w-5",
                  isMoreActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>More</SheetTitle>
            </SheetHeader>

            <div className="space-y-1">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-[48px] items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>

            {isTrainer && (
              <>
                <Separator className="my-4" />
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </p>
                <div className="space-y-1">
                  {adminItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex min-h-[48px] items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-accent"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5",
                              active ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </>
            )}

            <Separator className="my-4" />

            <form action="/api/auth/signout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                className="flex min-h-[48px] w-full items-center justify-start gap-4 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
