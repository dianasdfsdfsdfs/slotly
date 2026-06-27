import NextAuth from "next-auth"

import { authConfig } from "@/server/auth.config"

// Next.js 16 renamed the "middleware" convention to "proxy".
// Lightweight JWT-only auth instance (no adapter/bcrypt) for the edge runtime.
export const { auth: proxy } = NextAuth(authConfig)

export default proxy

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/onboarding/:path*"],
}
