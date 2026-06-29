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

export const tenantSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(60),
  slug: z
    .string()
    .trim()
    .min(2, "Booking link must be at least 2 characters")
    .max(40),
  timezone: z.string().min(1, "Select a timezone"),
  slotStepMinutes: z.number().int().min(5).max(120),
  bufferMinutes: z.number().int().min(0).max(120),
})

export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>
