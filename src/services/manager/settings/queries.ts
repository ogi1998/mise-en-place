import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	ServiceArea,
	Table,
	AreaLockPeriod,
	ServiceAreaFormData,
	TableFormData,
	AreaLockPeriodFormData
} from './types';

// ─── Service Areas ────────────────────────────────────────────────────────────

export async function getServiceAreas(supabase: SupabaseClient, restaurantId: string): Promise<ServiceArea[]> {
	const { data } = await supabase
		.from('service_areas')
		.select('*')
		.eq('restaurant_id', restaurantId)
		.order('sort_order', { ascending: true });

	return (data ?? []) as ServiceArea[];
}

export async function createServiceArea(
	supabase: SupabaseClient,
	restaurantId: string,
	form: ServiceAreaFormData
): Promise<{ data: ServiceArea | null; error: string | null }> {
	const { data, error } = await supabase
		.from('service_areas')
		.insert({
			...form,
			name: form.name.trim(),
			restaurant_id: restaurantId,
			description: form.description || null
		})
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			if (error.message.includes('sort_order')) {
				return { data: null, error: 'This sort order is already taken. Please choose a different one.' };
			}
			return { data: null, error: 'A service area with this name already exists.' };
		}
		return { data: null, error: error.message };
	}

	return { data: data as ServiceArea, error: null };
}

export async function updateServiceArea(
	supabase: SupabaseClient,
	id: string,
	form: Partial<ServiceAreaFormData>
): Promise<{ data: ServiceArea | null; error: string | null }> {
	const { data, error } = await supabase
		.from('service_areas')
		.update({
			...form,
			name: form.name?.trim(),
			description: form.description || null,
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			if (error.message.includes('sort_order')) {
				return { data: null, error: 'This sort order is already taken. Please choose a different one.' };
			}
			return { data: null, error: 'A service area with this name already exists.' };
		}
		return { data: null, error: error.message };
	}

	return { data: data as ServiceArea, error: null };
}

export async function deleteServiceArea(supabase: SupabaseClient, id: string): Promise<void> {
	await supabase.from('service_areas').delete().eq('id', id);
}

// ─── Tables ───────────────────────────────────────────────────────────────────

export async function getTables(
	supabase: SupabaseClient,
	restaurantId: string,
	serviceAreaId?: string
): Promise<Table[]> {
	let query = supabase
		.from('tables')
		.select('*')
		.eq('restaurant_id', restaurantId)
		.order('sort_order', { ascending: true });

	if (serviceAreaId) {
		query = query.eq('service_area_id', serviceAreaId);
	}

	const { data } = await query;

	return (data ?? []) as Table[];
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
			nickname: form.nickname || null
		})
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			if (error.message.includes('sort_order')) {
				return { data: null, error: 'This sort order is already taken in this area.' };
			}
			return { data: null, error: 'A table with this name already exists in this restaurant.' };
		}
		return { data: null, error: error.message };
	}

	return { data: data as Table, error: null };
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
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			if (error.message.includes('sort_order')) {
				return { data: null, error: 'This sort order is already taken in this area.' };
			}
			return { data: null, error: 'A table with this name already exists in this restaurant.' };
		}
		return { data: null, error: error.message };
	}

	return { data: data as Table, error: null };
}

export async function deleteTable(supabase: SupabaseClient, id: string): Promise<void> {
	await supabase.from('tables').delete().eq('id', id);
}

// ─── Area Lock Periods ────────────────────────────────────────────────────────

export async function getAreaLockPeriods(supabase: SupabaseClient, serviceAreaId: string): Promise<AreaLockPeriod[]> {
	const { data } = await supabase
		.from('area_lock_periods')
		.select('*')
		.eq('service_area_id', serviceAreaId)
		.order('start_date', { ascending: true });

	return (data ?? []) as AreaLockPeriod[];
}

export async function createAreaLockPeriod(
	supabase: SupabaseClient,
	restaurantId: string,
	serviceAreaId: string,
	form: AreaLockPeriodFormData
): Promise<{ data: AreaLockPeriod | null; error: string | null }> {
	const { data, error } = await supabase
		.from('area_lock_periods')
		.insert({
			...form,
			restaurant_id: restaurantId,
			service_area_id: serviceAreaId,
			name: form.name || null,
			reason: form.reason || null
		})
		.select()
		.single();

	if (error) {
		if (error.code === '23514') {
			return { data: null, error: 'End date must be after start date.' };
		}
		return { data: null, error: error.message };
	}

	return { data: data as AreaLockPeriod, error: null };
}

export async function deleteAreaLockPeriod(supabase: SupabaseClient, id: string): Promise<void> {
	await supabase.from('area_lock_periods').delete().eq('id', id);
}
