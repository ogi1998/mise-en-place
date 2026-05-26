import { z } from 'zod';

export const serviceAreaSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string(),
	is_indoor: z.boolean(),
	is_active: z.boolean(),
	is_bookable_online: z.boolean(),
	sort_order: z.number().min(1, 'Sort order must be at least 1')
});

export const areaLockPeriodSchema = z.object({
	name: z.string(),
	start_date: z.string().min(1, 'Start date is required'),
	end_date: z.string().min(1, 'End date is required'),
	reason: z.string()
});

export type ServiceAreaFormData = z.infer<typeof serviceAreaSchema>;
export type AreaLockPeriodFormData = z.infer<typeof areaLockPeriodSchema>;