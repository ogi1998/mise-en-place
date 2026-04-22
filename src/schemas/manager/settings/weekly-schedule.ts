import { z } from 'zod'

export const dayScheduleSchema = z
  .object({
    is_open: z.boolean(),
    open_time: z.string().nullable(),
    close_time: z.string().nullable(),
    pause_from: z.string().nullable(),
    pause_to: z.string().nullable(),
    slot_interval: z.number().int(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_open) return
    if (!data.open_time) {
      ctx.addIssue({ code: 'custom', path: ['open_time'], message: 'Required when open' })
    }
    if (!data.close_time) {
      ctx.addIssue({ code: 'custom', path: ['close_time'], message: 'Required when open' })
    }
    if (data.open_time && data.close_time && data.open_time >= data.close_time) {
      ctx.addIssue({ code: 'custom', path: ['close_time'], message: 'Must be after open time' })
    }
    if (data.pause_from && !data.pause_to) {
      ctx.addIssue({ code: 'custom', path: ['pause_to'], message: 'Required if pause start is set' })
    }
    if (!data.pause_from && data.pause_to) {
      ctx.addIssue({ code: 'custom', path: ['pause_from'], message: 'Required if pause end is set' })
    }
    if (data.pause_from && data.pause_to && data.pause_from >= data.pause_to) {
      ctx.addIssue({ code: 'custom', path: ['pause_to'], message: 'Must be after pause start' })
    }
  })

export type DayScheduleFormData = z.infer<typeof dayScheduleSchema>