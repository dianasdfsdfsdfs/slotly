import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { signInSchema } from "@/lib/validations/auth"
import { db } from "@/server/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        })
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
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
})
