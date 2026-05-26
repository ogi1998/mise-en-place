import { z } from 'zod'

export const voucherSchema = z.object({
  type: z.enum(['value', 'experience_menu', 'wine_pairing', 'hotel_addon']),
  amount: z.number().positive().nullable(),
  courses: z.number().int().nullable(),
  wines: z.number().int().nullable(),
  wine_guests: z.number().int().nullable(),
  hotel_addon: z.boolean(),
  delivery_type: z.enum(['digital', 'physical', 'print']),
  delivery_address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).nullable(),
  buyer_name: z.string().min(1, 'Buyer name is required'),
  buyer_email: z.email('Valid email is required'),
  buyer_phone: z.string().nullable(),
  recipient_name: z.string().nullable(),
  dedication: z.string().nullable(),
}).superRefine((data, ctx) => {
  if (data.type === 'value' && (data.amount === null || data.amount === undefined)) {
    ctx.addIssue({ code: 'custom', path: ['amount'], message: 'Amount is required for value vouchers' })
  }
  if (data.type === 'experience_menu' && !data.courses) {
    ctx.addIssue({ code: 'custom', path: ['courses'], message: 'Number of courses is required' })
  }
  if (data.delivery_type === 'physical' && !data.delivery_address) {
    ctx.addIssue({ code: 'custom', path: ['delivery_address'], message: 'Delivery address is required for physical delivery' })
  }
})

export type VoucherFormData = z.infer<typeof voucherSchema>
