import { z } from 'zod'

export const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  time_start: z.string().min(1, 'Start time is required'),
  time_end: z.string().min(1, 'End time is required'),
  capacity: z.number().int().min(1).nullable(),
  is_public: z.boolean(),
  locked_area_ids: z.array(z.string()),
})

export type EventFormData = z.infer<typeof eventSchema>
