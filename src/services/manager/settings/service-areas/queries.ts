import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	ServiceArea,
	AreaLockPeriod,
} from './types';
import type { ServiceAreaFormData, AreaLockPeriodFormData } from '@/schemas/manager/settings/service-areas'

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
