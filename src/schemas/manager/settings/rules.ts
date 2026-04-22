import { z } from 'zod'

export const rulesSchema = z.object({
  min_guests: z.number().int().min(1),
  max_guests_online: z.number().int().min(1),
  default_guests: z.number().int().min(1),
  booking_duration: z.number().int().min(15),
  buffer_time: z.number().int().min(0),
  min_time_before_slot: z.number().int().min(0),
  booking_before_closing: z.number().int().min(0),
  future_booking_window: z.number().int().min(1),
  delay_validity: z.number().int().min(1),
  cancellation_window_days: z.number().int().min(0),
  cancellation_window_hours: z.number().int().min(0),
  waitlist_enabled: z.boolean(),
  waitlist_confirmation_window: z.number().int().min(1),
  reminder_intervals: z.array(z.number().int()),
  thank_you_email: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.default_guests < data.min_guests) {
    ctx.addIssue({ code: 'custom', path: ['default_guests'], message: 'Must be ≥ min guests' })
  }
  if (data.default_guests > data.max_guests_online) {
    ctx.addIssue({ code: 'custom', path: ['default_guests'], message: 'Must be ≤ max guests' })
  }
  if (data.min_guests > data.max_guests_online) {
    ctx.addIssue({ code: 'custom', path: ['max_guests_online'], message: 'Must be ≥ min guests' })
  }
})

export type RulesFormData = z.infer<typeof rulesSchema>