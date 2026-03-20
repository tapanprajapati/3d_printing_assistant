import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAuthPage = pathname.startsWith("/login");
      const isApiRoute = pathname.startsWith("/api");
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/", request.nextUrl));
      }
      if (!isLoggedIn && !isAuthPage && !isApiRoute) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [],
};
