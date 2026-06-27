import { z } from "zod"

export const staffFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60),
  bio: z.string().trim().max(500).optional(),
  active: z.boolean(),
})

export type StaffFormValues = z.infer<typeof staffFormSchema>

export const workingHoursSchema = z
  .array(
    z
      .object({
        weekday: z.number().int().min(0).max(6),
        startMinutes: z.number().int().min(0).max(1439),
        endMinutes: z.number().int().min(1).max(1440),
      })
      .refine((v) => v.endMinutes > v.startMinutes, {
        message: "End time must be after start time",
        path: ["endMinutes"],
      })
  )
  .max(7)

export type WorkingHoursInput = z.infer<typeof workingHoursSchema>
