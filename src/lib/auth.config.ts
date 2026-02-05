import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
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
