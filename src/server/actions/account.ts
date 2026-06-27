"use server"

import { revalidatePath } from "next/cache"

import { profileSchema } from "@/lib/validations/account"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

type ActionResult = { success: true } | { success: false; error: string }

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Please sign in." }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  })

  revalidatePath("/account/settings")
  return { success: true }
}
