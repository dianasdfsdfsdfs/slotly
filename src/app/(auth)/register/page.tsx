import { type Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Create account",
}

export default function RegisterPage() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6 space-y-1.5">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start taking bookings in minutes.
        </p>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
