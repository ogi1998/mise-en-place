export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      area_lock_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string | null
          reason: string | null
          restaurant_id: string
          service_area_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name?: string | null
          reason?: string | null
          restaurant_id: string
          service_area_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string | null
          reason?: string | null
          restaurant_id?: string
          service_area_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "area_lock_periods_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "area_lock_periods_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_rules: {
        Row: {
          booking_before_closing: number
          booking_duration: number
          buffer_time: number
          cancellation_window_days: number
          cancellation_window_hours: number
          created_at: string
          default_guests: number
          delay_validity: number
          future_booking_window: number
          id: string
          max_guests_online: number
          min_guests: number
          min_time_before_slot: number
          reminder_intervals: number[]
          restaurant_id: string
          service_area_id: string
          thank_you_email: boolean
          updated_at: string
          waitlist_confirmation_window: number
          waitlist_enabled: boolean
        }
        Insert: {
          booking_before_closing?: number
          booking_duration?: number
          buffer_time?: number
          cancellation_window_days?: number
          cancellation_window_hours?: number
          created_at?: string
          default_guests?: number
          delay_validity?: number
          future_booking_window?: number
          id?: string
          max_guests_online?: number
          min_guests?: number
          min_time_before_slot?: number
          reminder_intervals?: number[]
          restaurant_id: string
          service_area_id: string
          thank_you_email?: boolean
          updated_at?: string
          waitlist_confirmation_window?: number
          waitlist_enabled?: boolean
        }
        Update: {
          booking_before_closing?: number
          booking_duration?: number
          buffer_time?: number
          cancellation_window_days?: number
          cancellation_window_hours?: number
          created_at?: string
          default_guests?: number
          delay_validity?: number
          future_booking_window?: number
          id?: string
          max_guests_online?: number
          min_guests?: number
          min_time_before_slot?: number
          reminder_intervals?: number[]
          restaurant_id?: string
          service_area_id?: string
          thank_you_email?: boolean
          updated_at?: string
          waitlist_confirmation_window?: number
          waitlist_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "booking_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rules_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: true
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_tables: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          restaurant_id: string
          table_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          restaurant_id: string
          table_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          restaurant_id?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_tables_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_tables_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          allergens: string[] | null
          booking_date: string
          booking_number: number
          cancellation_reason: string | null
          cancelled_at: string | null
          company_name: string | null
          confirmed_at: string | null
          created_at: string
          delay_notified_at: string | null
          end_time: string
          guest_id: string | null
          guest_message: string | null
          id: string
          internal_notes: string | null
          is_delayed: boolean
          is_walkin: boolean | null
          marks: Json | null
          notes: string | null
          party_size: number
          reminder_sent_at: string | null
          restaurant_id: string
          service_area_id: string
          source: string
          spend_amount: number | null
          start_time: string
          status: string
          updated_at: string
          voucher_id: string | null
        }
        Insert: {
          allergens?: string[] | null
          booking_date: string
          booking_number?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          company_name?: string | null
          confirmed_at?: string | null
          created_at?: string
          delay_notified_at?: string | null
          end_time: string
          guest_id?: string | null
          guest_message?: string | null
          id?: string
          internal_notes?: string | null
          is_delayed?: boolean
          is_walkin?: boolean | null
          marks?: Json | null
          notes?: string | null
          party_size: number
          reminder_sent_at?: string | null
          restaurant_id: string
          service_area_id: string
          source?: string
          spend_amount?: number | null
          start_time: string
          status?: string
          updated_at?: string
          voucher_id?: string | null
        }
        Update: {
          allergens?: string[] | null
          booking_date?: string
          booking_number?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          company_name?: string | null
          confirmed_at?: string | null
          created_at?: string
          delay_notified_at?: string | null
          end_time?: string
          guest_id?: string | null
          guest_message?: string | null
          id?: string
          internal_notes?: string | null
          is_delayed?: boolean
          is_walkin?: boolean | null
          marks?: Json | null
          notes?: string | null
          party_size?: number
          reminder_sent_at?: string | null
          restaurant_id?: string
          service_area_id?: string
          source?: string
          spend_amount?: number | null
          start_time?: string
          status?: string
          updated_at?: string
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          cover_image: string | null
          created_at: string
          custom_fields: Json | null
          date: string
          id: string
          is_public: boolean
          locked_area_ids: string[] | null
          name: string
          restaurant_id: string
          time_end: string
          time_start: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          cover_image?: string | null
          created_at?: string
          custom_fields?: Json | null
          date: string
          id?: string
          is_public?: boolean
          locked_area_ids?: string[] | null
          name: string
          restaurant_id: string
          time_end: string
          time_start: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          cover_image?: string | null
          created_at?: string
          custom_fields?: Json | null
          date?: string
          id?: string
          is_public?: boolean
          locked_area_ids?: string[] | null
          name?: string
          restaurant_id?: string
          time_end?: string
          time_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          allergens: string[] | null
          anniversary: string | null
          auth_id: string | null
          auth_user_id: string | null
          birthday: string | null
          company: string | null
          company_position: string | null
          company_tax_id: string | null
          created_at: string
          dietary_type: string | null
          email: string | null
          favourite_food: Json | null
          favourite_wine: Json | null
          first_name: string
          id: string
          internal_notes: string | null
          last_name: string
          lifetime_spend: number | null
          locale: string | null
          loyalty_tier: string | null
          marketing_consent: boolean
          phone: string | null
          seating_preference: string | null
          total_visits: number | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          anniversary?: string | null
          auth_id?: string | null
          auth_user_id?: string | null
          birthday?: string | null
          company?: string | null
          company_position?: string | null
          company_tax_id?: string | null
          created_at?: string
          dietary_type?: string | null
          email?: string | null
          favourite_food?: Json | null
          favourite_wine?: Json | null
          first_name: string
          id?: string
          internal_notes?: string | null
          last_name: string
          lifetime_spend?: number | null
          locale?: string | null
          loyalty_tier?: string | null
          marketing_consent?: boolean
          phone?: string | null
          seating_preference?: string | null
          total_visits?: number | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          anniversary?: string | null
          auth_id?: string | null
          auth_user_id?: string | null
          birthday?: string | null
          company?: string | null
          company_position?: string | null
          company_tax_id?: string | null
          created_at?: string
          dietary_type?: string | null
          email?: string | null
          favourite_food?: Json | null
          favourite_wine?: Json | null
          first_name?: string
          id?: string
          internal_notes?: string | null
          last_name?: string
          lifetime_spend?: number | null
          locale?: string | null
          loyalty_tier?: string | null
          marketing_consent?: boolean
          phone?: string | null
          seating_preference?: string | null
          total_visits?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          restaurant_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          restaurant_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          restaurant_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          available_languages: string[] | null
          bank_account_holder: string | null
          bank_bic: string | null
          bank_iban: string | null
          bank_name: string | null
          city: string | null
          country: string
          cover_url: string | null
          created_at: string
          currency: string | null
          default_language: string | null
          email: string | null
          hide_closed_days: boolean | null
          id: string
          is_active: boolean
          locale: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          time_format: string | null
          timezone: string
          updated_at: string
          vouchers_enabled: boolean
          week_start: string | null
        }
        Insert: {
          address?: string | null
          available_languages?: string[] | null
          bank_account_holder?: string | null
          bank_bic?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          default_language?: string | null
          email?: string | null
          hide_closed_days?: boolean | null
          id?: string
          is_active?: boolean
          locale?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          time_format?: string | null
          timezone?: string
          updated_at?: string
          vouchers_enabled?: boolean
          week_start?: string | null
        }
        Update: {
          address?: string | null
          available_languages?: string[] | null
          bank_account_holder?: string | null
          bank_bic?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string
          cover_url?: string | null
          created_at?: string
          currency?: string | null
          default_language?: string | null
          email?: string | null
          hide_closed_days?: boolean | null
          id?: string
          is_active?: boolean
          locale?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          time_format?: string | null
          timezone?: string
          updated_at?: string
          vouchers_enabled?: boolean
          week_start?: string | null
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_bookable_online: boolean
          is_indoor: boolean
          name: string
          restaurant_id: string
          slug: string | null
          sort_order: number
          substitute_area_id: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_bookable_online?: boolean
          is_indoor?: boolean
          name: string
          restaurant_id: string
          slug?: string | null
          sort_order?: number
          substitute_area_id?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_bookable_online?: boolean
          is_indoor?: boolean
          name?: string
          restaurant_id?: string
          slug?: string | null
          sort_order?: number
          substitute_area_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_areas_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_areas_substitute_area_id_fkey"
            columns: ["substitute_area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      special_days: {
        Row: {
          close_time: string | null
          created_at: string
          date: string
          date_end: string | null
          id: string
          is_recurring: boolean
          name: string
          open_time: string | null
          pause_from: string | null
          pause_to: string | null
          restaurant_id: string
          service_area_id: string | null
          slot_interval: number | null
          type: string
          updated_at: string
          weather_status: string | null
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          date: string
          date_end?: string | null
          id?: string
          is_recurring?: boolean
          name: string
          open_time?: string | null
          pause_from?: string | null
          pause_to?: string | null
          restaurant_id: string
          service_area_id?: string | null
          slot_interval?: number | null
          type: string
          updated_at?: string
          weather_status?: string | null
        }
        Update: {
          close_time?: string | null
          created_at?: string
          date?: string
          date_end?: string | null
          id?: string
          is_recurring?: boolean
          name?: string
          open_time?: string | null
          pause_from?: string | null
          pause_to?: string | null
          restaurant_id?: string
          service_area_id?: string | null
          slot_interval?: number | null
          type?: string
          updated_at?: string
          weather_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "special_days_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_days_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      table_combination_members: {
        Row: {
          combination_id: string
          table_id: string
        }
        Insert: {
          combination_id: string
          table_id: string
        }
        Update: {
          combination_id?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_combination_members_combination_id_fkey"
            columns: ["combination_id"]
            isOneToOne: false
            referencedRelation: "table_combinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_combination_members_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_combinations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_seats: number
          min_seats: number
          name: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_seats: number
          min_seats: number
          name?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_seats?: number
          min_seats?: number
          name?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_combinations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          allow_multi: boolean
          created_at: string
          floor_plan_rotation: number | null
          floor_plan_x: number | null
          floor_plan_y: number | null
          id: string
          is_active: boolean
          is_active_online: boolean
          max_seats: number
          min_seats: number
          name: string
          nickname: string | null
          restaurant_id: string
          seats: number
          service_area_id: string
          shape: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          allow_multi?: boolean
          created_at?: string
          floor_plan_rotation?: number | null
          floor_plan_x?: number | null
          floor_plan_y?: number | null
          id?: string
          is_active?: boolean
          is_active_online?: boolean
          max_seats?: number
          min_seats?: number
          name: string
          nickname?: string | null
          restaurant_id: string
          seats?: number
          service_area_id: string
          shape?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          allow_multi?: boolean
          created_at?: string
          floor_plan_rotation?: number | null
          floor_plan_x?: number | null
          floor_plan_y?: number | null
          id?: string
          is_active?: boolean
          is_active_online?: boolean
          max_seats?: number
          min_seats?: number
          name?: string
          nickname?: string | null
          restaurant_id?: string
          seats?: number
          service_area_id?: string
          shape?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          amount: number | null
          buyer_email: string
          buyer_name: string
          buyer_phone: string | null
          code: string
          courses: number | null
          created_at: string
          dedication: string | null
          delivery_address: Json | null
          delivery_type: string
          expires_at: string | null
          hotel_addon: boolean
          id: string
          issued_at: string | null
          recipient_name: string | null
          redeemed_at: string | null
          redeemed_by_guest_id: string | null
          restaurant_id: string
          status: string
          type: string
          updated_at: string
          wine_guests: number | null
          wines: number | null
        }
        Insert: {
          amount?: number | null
          buyer_email: string
          buyer_name: string
          buyer_phone?: string | null
          code: string
          courses?: number | null
          created_at?: string
          dedication?: string | null
          delivery_address?: Json | null
          delivery_type?: string
          expires_at?: string | null
          hotel_addon?: boolean
          id?: string
          issued_at?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          redeemed_by_guest_id?: string | null
          restaurant_id: string
          status?: string
          type: string
          updated_at?: string
          wine_guests?: number | null
          wines?: number | null
        }
        Update: {
          amount?: number | null
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string | null
          code?: string
          courses?: number | null
          created_at?: string
          dedication?: string | null
          delivery_address?: Json | null
          delivery_type?: string
          expires_at?: string | null
          hotel_addon?: boolean
          id?: string
          issued_at?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          redeemed_by_guest_id?: string | null
          restaurant_id?: string
          status?: string
          type?: string
          updated_at?: string
          wine_guests?: number | null
          wines?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_redeemed_by_guest_id_fkey"
            columns: ["redeemed_by_guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          confirmation_deadline: string | null
          created_at: string
          guest_id: string | null
          id: string
          notified_at: string | null
          party_size: number
          preferred_date: string
          preferred_time: string | null
          restaurant_id: string
          service_area_id: string
          status: string
          updated_at: string
        }
        Insert: {
          confirmation_deadline?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          notified_at?: string | null
          party_size: number
          preferred_date: string
          preferred_time?: string | null
          restaurant_id: string
          service_area_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          confirmation_deadline?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          notified_at?: string | null
          party_size?: number
          preferred_date?: string
          preferred_time?: string | null
          restaurant_id?: string
          service_area_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_schedules: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string | null
          pause_from: string | null
          pause_to: string | null
          restaurant_id: string
          service_area_id: string
          slot_interval: number
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          pause_from?: string | null
          pause_to?: string | null
          restaurant_id: string
          service_area_id: string
          slot_interval?: number
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          pause_from?: string | null
          pause_to?: string | null
          restaurant_id?: string
          service_area_id?: string
          slot_interval?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_schedules_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["manager"],
    },
  },
} as const
