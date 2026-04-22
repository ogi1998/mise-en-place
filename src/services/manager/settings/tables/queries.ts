import type { SupabaseClient } from '@supabase/supabase-js'
import type { Table } from './types'
import type { TableFormData } from '@/schemas/manager/settings/tables'

export async function getTables(
  supabase: SupabaseClient,
  restaurantId: string,
  serviceAreaId?: string
): Promise<Table[]> {
  let query = supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true })

  if (serviceAreaId) {
    query = query.eq('service_area_id', serviceAreaId)
  }

  const { data } = await query

  return (data ?? []) as Table[]
}

export async function createTable(
  supabase: SupabaseClient,
  restaurantId: string,
  serviceAreaId: string,
  form: TableFormData
): Promise<{ data: Table | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tables')
    .insert({
      ...form,
      name: form.name.trim(),
      restaurant_id: restaurantId,
      service_area_id: serviceAreaId,
      nickname: form.nickname || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('sort_order')) {
        return { data: null, error: 'This sort order is already taken in this area.' }
      }
      return { data: null, error: 'A table with this name already exists in this restaurant.' }
    }
    return { data: null, error: error.message }
  }

  return { data: data as Table, error: null }
}

export async function updateTable(
  supabase: SupabaseClient,
  id: string,
  form: Partial<TableFormData>
): Promise<{ data: Table | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tables')
    .update({
      ...form,
      ...(form.name && { name: form.name.trim() }),
      nickname: form.nickname !== undefined ? form.nickname || null : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('sort_order')) {
        return { data: null, error: 'This sort order is already taken in this area.' }
      }
      return { data: null, error: 'A table with this name already exists in this restaurant.' }
    }
    return { data: null, error: error.message }
  }

  return { data: data as Table, error: null }
}

export async function deleteTable(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  await supabase.from('tables').delete().eq('id', id)
}