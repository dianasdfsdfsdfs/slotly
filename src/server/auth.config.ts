import type { NextAuthConfig } from "next-auth"

// Edge-safe base config (no Prisma / bcrypt). Shared by the full auth instance
// (src/server/auth.ts) and the middleware instance (src/middleware.ts).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
    jwt: ({ token, user }) => {
      if (user) token.id = user.id
      return token
    },
    session: ({ session, token }) => {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id
      }
      return session
    },
  },
} satisfies NextAuthConfig
