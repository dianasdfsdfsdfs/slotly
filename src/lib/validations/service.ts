import { z } from "zod"

export const serviceFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().trim().max(500).optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "Minimum 5 minutes")
    .max(480, "Maximum 8 hours"),
  price: z.number().min(0, "Price can't be negative").max(100000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a color"),
  active: z.boolean(),
})

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

export const SERVICE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f43f5e",
  "#f59e0b",
  "#2dd4bf",
] as const

export const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 180] as const
