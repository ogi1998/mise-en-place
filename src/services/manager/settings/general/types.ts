export type GeneralSettings = {
  time_format: '24h' | '12h' | null
  week_start: 'monday' | 'sunday' | null
  hide_closed_days: boolean | null
  available_languages: string[] | null
  default_language: string | null
  timezone: string | null
  currency: string | null
}
