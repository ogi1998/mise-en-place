'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getBookingsForDate } from '@/services/manager/bookings/queries'
import type { BookingListItem } from '@/services/manager/bookings/types'

export function useBookings(restaurantId: string, initialDate: string, initialBookings: BookingListItem[]) {
  const [date, setDate] = useState(initialDate)
  const [bookings, setBookings] = useState(initialBookings)
  const [loading, setLoading] = useState(false)

  const fetchBookings = useCallback(async (newDate: string) => {
    setLoading(true)
    const data = await getBookingsForDate(supabase, restaurantId, newDate)
    setBookings(data)
    setLoading(false)
  }, [restaurantId])

  async function handleDateChange(newDate: string) {
    setDate(newDate)
    await fetchBookings(newDate)
  }

  function handleBookingUpdate(updated: BookingListItem) {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
  }

  return { date, bookings, loading, handleDateChange, handleBookingUpdate }
}