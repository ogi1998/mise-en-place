export type GeneralSettings = {
  time_format: '24h' | '12h' | null
  week_start: 'monday' | 'sunday' | null
  hide_closed_days: boolean | null
  available_languages: string[] | null
  default_language: string | null
  timezone: string | null
  currency: string | null
  bank_iban: string | null
  bank_name: string | null
  bank_bic: string | null
  bank_account_holder: string | null
  vouchers_enabled: boolean | null
}
