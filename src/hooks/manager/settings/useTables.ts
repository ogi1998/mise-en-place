import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { createTable, updateTable, deleteTable } from '@/services/manager/settings/tables/queries';
import { tableSchema, type TableFormData } from '@/schemas/manager/settings/tables';
import type { Table } from '@/services/manager/settings/tables/types';
import type { ServiceArea } from '@/services/manager/settings/service-areas/types';

const DEFAULT_TABLE_FORM: TableFormData = {
	name: '',
	nickname: '',
	shape: 'rectangle',
	sort_order: 1,
	min_seats: 1,
	seats: 2,
	max_seats: 4,
	allow_multi: false,
	is_active: false,
	is_active_online: false
};

export function useTables(initialAreas: ServiceArea[], initialTables: Table[], restaurantId: string) {
	const [tables, setTables] = useState<Table[]>(initialTables);
	const [activeAreaId, setActiveAreaId] = useState<string>(initialAreas[0]?.id ?? '');

	const [showForm, setShowForm] = useState(false);
	const [editingTable, setEditingTable] = useState<Table | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [toggleError, setToggleError] = useState<string | null>(null);

	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

	const form = useForm<TableFormData>({
		resolver: zodResolver(tableSchema),
		defaultValues: DEFAULT_TABLE_FORM
	});

	const areaTables = tables.filter((t) => t.service_area_id === activeAreaId);

	// ── Handlers ───────────────────────────────────────────────────────────────

	function handleSelectArea(areaId: string) {
		setActiveAreaId(areaId);
		setShowForm(false);
		setEditingTable(null);
		setFormError(null);
		setToggleError(null);
		form.reset(DEFAULT_TABLE_FORM);
	}

	function handleOpenCreate() {
		setEditingTable(null);
		setFormError(null);
		form.reset({ ...DEFAULT_TABLE_FORM, sort_order: areaTables.length + 1 });
		setShowForm(true);
	}

	function handleOpenEdit(table: Table) {
		setEditingTable(table);
		setFormError(null);
		form.reset({
			name: table.name,
			nickname: table.nickname ?? '',
			shape: table.shape,
			sort_order: table.sort_order,
			min_seats: table.min_seats,
			seats: table.seats,
			max_seats: table.max_seats,
			allow_multi: table.allow_multi,
			is_active: table.is_active,
			is_active_online: table.is_active_online
		});
		setShowForm(true);
	}

	function handleCancel() {
		setShowForm(false);
		setEditingTable(null);
		setFormError(null);
		form.reset(DEFAULT_TABLE_FORM);
	}

	async function handleSubmit(formData: TableFormData) {
		setFormLoading(true);
		setFormError(null);

		if (editingTable) {
			const { data: updated, error } = await updateTable(supabase, editingTable.id, formData);
			if (error) {
				setFormError(error);
				setFormLoading(false);
				return;
			}
			if (updated) {
				setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
			}
		} else {
			const { data: created, error } = await createTable(supabase, restaurantId, activeAreaId, formData);
			if (error) {
				setFormError(error);
				setFormLoading(false);
				return;
			}
			if (created) {
				setTables((prev) => [...prev, created]);
			}
		}

		setFormLoading(false);
		handleCancel();
	}

	async function handleDelete(id: string) {
		await deleteTable(supabase, id);
		setTables((prev) => prev.filter((t) => t.id !== id));
		setConfirmDelete(null);
	}

	async function handleToggleField(table: Table, field: 'is_active' | 'is_active_online') {
		setToggleError(null);
		const { data: updated, error } = await updateTable(supabase, table.id, { [field]: !table[field] });
		if (error) {
			setToggleError(error);
			return;
		}
		if (updated) {
			setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
		}
	}

	return {
		tables,
		activeAreaId,
		areaTables,
		showForm,
		editingTable,
		form,
		formLoading,
		formError,
		toggleError,
		confirmDelete,
		setConfirmDelete,
		handleSelectArea,
		handleOpenCreate,
		handleOpenEdit,
		handleCancel,
		handleSubmit,
		handleDelete,
		handleToggleField
	};
}
