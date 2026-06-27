import { z } from "zod"

export const createTenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(60),
  timezone: z.string().min(1, "Select a timezone"),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>
