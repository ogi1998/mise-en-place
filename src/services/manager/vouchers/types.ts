export type VoucherType = 'value' | 'experience_menu' | 'wine_pairing' | 'hotel_addon'
export type VoucherStatus = 'pending' | 'active' | 'redeemed' | 'expired'
export type DeliveryType = 'digital' | 'physical' | 'print'

export type DeliveryAddress = {
  street?: string
  city?: string
  postal_code?: string
  country?: string
}

export type Voucher = {
  id: string
  restaurant_id: string
  type: VoucherType
  amount: number | null
  courses: number | null
  wines: number | null
  wine_guests: number | null
  hotel_addon: boolean
  delivery_type: DeliveryType
  delivery_address: DeliveryAddress | null
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  recipient_name: string | null
  dedication: string | null
  code: string
  status: VoucherStatus
  issued_at: string | null
  expires_at: string | null
  redeemed_at: string | null
  redeemed_by_guest_id: string | null
  created_at: string
  updated_at: string
}
