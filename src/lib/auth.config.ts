import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPortal = nextUrl.pathname.startsWith("/portal") || nextUrl.pathname.startsWith("/dashboard");
      const isAdmin = nextUrl.pathname.startsWith("/portal/admin");
      const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

      if (isAdmin) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as any)?.role;
        if (role !== "TRAINER") {
          return Response.redirect(new URL("/portal/dashboard", nextUrl));
        }
        return true;
      }

      if (isPortal) {
        if (!isLoggedIn) return false;
        return true;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/portal/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
