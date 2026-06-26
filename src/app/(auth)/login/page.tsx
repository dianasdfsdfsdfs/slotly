import { type Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function LoginPage() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6 space-y-1.5">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to {"Slotly"}?{" "}
        <Link href="/register" className="text-emerald-400 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
