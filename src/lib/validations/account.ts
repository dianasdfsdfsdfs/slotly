import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().trim().max(30).optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
