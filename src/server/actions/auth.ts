"use server"

import bcrypt from "bcryptjs"

import { signUpSchema } from "@/lib/validations/auth"
import { signOut } from "@/server/auth"
import { db } from "@/server/db"

type RegisterResult = { success: true } | { success: false; error: string }

export async function registerUser(input: unknown): Promise<RegisterResult> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  const { name, email, password } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  })
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.create({
    data: { name, email: normalizedEmail, passwordHash },
  })

  return { success: true }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}
