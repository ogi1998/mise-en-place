import { z } from 'zod'

export const specialDaySchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    date: z.string().min(1, 'Date is required'),
    date_end: z.string().nullable(),
    service_area_id: z.string().nullable(),
    type: z.enum(['closed', 'open', 'modified']),
    open_time: z.string().nullable(),
    close_time: z.string().nullable(),
    pause_from: z.string().nullable(),
    pause_to: z.string().nullable(),
    slot_interval: z.number().int().nullable(),
    is_recurring: z.boolean(),
    weather_status: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.date_end && data.date_end <= data.date) {
      ctx.addIssue({ code: 'custom', path: ['date_end'], message: 'End date must be after start date' })
    }
    if (data.type !== 'modified') return
    if (!data.open_time) {
      ctx.addIssue({ code: 'custom', path: ['open_time'], message: 'Required for modified hours' })
    }
    if (!data.close_time) {
      ctx.addIssue({ code: 'custom', path: ['close_time'], message: 'Required for modified hours' })
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
  })

export type SpecialDayFormData = z.infer<typeof specialDaySchema>

export const EMPTY_FORM: SpecialDayFormData = {
  name: '',
  date: '',
  date_end: null,
  service_area_id: null,
  type: 'closed',
  open_time: null,
  close_time: null,
  pause_from: null,
  pause_to: null,
  slot_interval: 30,
  is_recurring: false,
  weather_status: null,
}
