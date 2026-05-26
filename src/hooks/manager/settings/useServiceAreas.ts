import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import {
	createServiceArea,
	updateServiceArea,
	deleteServiceArea,
	getAreaLockPeriods,
	createAreaLockPeriod,
	deleteAreaLockPeriod
} from '@/services/manager/settings/service-areas/queries';
import {
	serviceAreaSchema,
	areaLockPeriodSchema,
	type ServiceAreaFormData,
	type AreaLockPeriodFormData
} from '@/schemas/manager/settings/service-areas';
import type { ServiceArea, AreaLockPeriod } from '@/services/manager/settings/service-areas/types';

export function useServiceAreas(initialAreas: ServiceArea[], restaurantId: string) {
	const [areas, setAreas] = useState<ServiceArea[]>(initialAreas);
	const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
	const [lockPeriods, setLockPeriods] = useState<Record<string, AreaLockPeriod[]>>({});
	const [loadingLocks, setLoadingLocks] = useState<string | null>(null);

	const [showAreaForm, setShowAreaForm] = useState(false);
	const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
	const [areaFormLoading, setAreaFormLoading] = useState(false);
	const [areaFormError, setAreaFormError] = useState<string | null>(null);

	const [showLockForm, setShowLockForm] = useState<string | null>(null);
	const [lockFormLoading, setLockFormLoading] = useState(false);
	const [lockFormError, setLockFormError] = useState<string | null>(null);

	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

	const areaForm = useForm<ServiceAreaFormData>({
		resolver: zodResolver(serviceAreaSchema),
		defaultValues: {
			name: '',
			description: '',
			is_indoor: true,
			is_active: true,
			is_bookable_online: true,
			sort_order: 1
		}
	});

	const lockForm = useForm<AreaLockPeriodFormData>({
		resolver: zodResolver(areaLockPeriodSchema),
		defaultValues: {
			name: '',
			start_date: '',
			end_date: '',
			reason: ''
		}
	});

	// ── Areas ──────────────────────────────────────────────────────────────────

	async function handleToggleExpand(areaId: string) {
		if (expandedAreaId === areaId) {
			setExpandedAreaId(null);
			return;
		}
		setExpandedAreaId(areaId);
		if (!lockPeriods[areaId]) {
			setLoadingLocks(areaId);
			const periods = await getAreaLockPeriods(supabase, areaId);
			setLockPeriods((prev) => ({ ...prev, [areaId]: periods }));
			setLoadingLocks(null);
		}
	}

	function handleOpenCreate() {
		setEditingArea(null);
		areaForm.reset({
			name: '',
			description: '',
			is_indoor: true,
			is_active: true,
			is_bookable_online: true,
			sort_order: areas.length + 1
		});
		setAreaFormError(null);
		setShowAreaForm(true);
	}

	function handleOpenEdit(area: ServiceArea) {
		setEditingArea(area);
		areaForm.reset({
			name: area.name,
			description: area.description ?? '',
			is_indoor: area.is_indoor,
			is_active: area.is_active,
			is_bookable_online: area.is_bookable_online,
			sort_order: area.sort_order
		});
		setAreaFormError(null);
		setShowAreaForm(true);
	}

	function handleCancelAreaForm() {
		setShowAreaForm(false);
		setEditingArea(null);
		setAreaFormError(null);
		areaForm.reset();
	}

	async function handleSubmitArea(data: ServiceAreaFormData) {
		setAreaFormLoading(true);
		setAreaFormError(null);

		if (editingArea) {
			const { data: updated, error } = await updateServiceArea(supabase, editingArea.id, data);
			if (error) {
				setAreaFormError(error);
				setAreaFormLoading(false);
				return;
			}
			if (updated) {
				setAreas((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
			}
		} else {
			const { data: created, error } = await createServiceArea(supabase, restaurantId, data);
			if (error) {
				setAreaFormError(error);
				setAreaFormLoading(false);
				return;
			}
			if (created) {
				setAreas((prev) => [...prev, created]);
			}
		}

		setAreaFormLoading(false);
		handleCancelAreaForm();
	}

	async function handleDeleteArea(id: string) {
		await deleteServiceArea(supabase, id);
		setAreas((prev) => prev.filter((a) => a.id !== id));
		setConfirmDelete(null);
		if (expandedAreaId === id) setExpandedAreaId(null);
	}

	// ── Lock periods ───────────────────────────────────────────────────────────

	function handleOpenLockForm(areaId: string) {
		lockForm.reset();
		setShowLockForm(areaId);
	}

	function handleCancelLockForm() {
		setShowLockForm(null);
		setLockFormError(null);
		lockForm.reset();
	}

	async function handleSubmitLock(areaId: string, data: AreaLockPeriodFormData) {
		setLockFormLoading(true);
		setLockFormError(null);

		const { data: created, error } = await createAreaLockPeriod(supabase, restaurantId, areaId, data);
		if (error) {
			setLockFormError(error);
			setLockFormLoading(false);
			return;
		}
		if (created) {
			setLockPeriods((prev) => ({
				...prev,
				[areaId]: [...(prev[areaId] ?? []), created]
			}));
		}

		setLockFormLoading(false);
		handleCancelLockForm();
	}

	async function handleDeleteLock(areaId: string, lockId: string) {
		await deleteAreaLockPeriod(supabase, lockId);
		setLockPeriods((prev) => ({
			...prev,
			[areaId]: prev[areaId].filter((l) => l.id !== lockId)
		}));
	}

	return {
		areas,
		expandedAreaId,
		lockPeriods,
		loadingLocks,
		showAreaForm,
		editingArea,
		areaForm,
		areaFormLoading,
		areaFormError,
		showLockForm,
		lockForm,
		lockFormLoading,
    lockFormError,
		confirmDelete,
		setConfirmDelete,
		handleToggleExpand,
		handleOpenCreate,
		handleOpenEdit,
		handleCancelAreaForm,
		handleSubmitArea,
		handleDeleteArea,
		handleOpenLockForm,
		handleCancelLockForm,
		handleSubmitLock,
		handleDeleteLock
	};
}
