import { z } from 'zod'

export const generalSchema = z.object({
  time_format: z.enum(['24h', '12h']),
  week_start: z.enum(['monday', 'sunday']),
  hide_closed_days: z.boolean(),
  available_languages: z.array(z.string()).min(1, 'Select at least one language'),
  default_language: z.string().min(1, 'Select a default language'),
  timezone: z.string().min(1, 'Select a timezone'),
  currency: z.string().min(1, 'Select a currency'),
  bank_iban: z.string(),
  bank_name: z.string(),
  bank_bic: z.string(),
  bank_account_holder: z.string(),
  vouchers_enabled: z.boolean(),
}).superRefine((data, ctx) => {
  if (!data.available_languages.includes(data.default_language)) {
    ctx.addIssue({
      code: 'custom',
      path: ['default_language'],
      message: 'Default language must be one of the selected languages',
    })
  }
})

export type GeneralFormData = z.infer<typeof generalSchema>
