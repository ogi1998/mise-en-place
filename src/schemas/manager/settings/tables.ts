import { z } from 'zod';

export const tableSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		nickname: z.string(),
		shape: z.enum(['rectangle', 'square', 'circle', 'oval']),
		sort_order: z.number().min(0, 'Sort order must be at least 0'),
		min_seats: z.number().min(1, 'Min seats must be at least 1'),
		seats: z.number().min(1, 'Default seats must be at least 1'),
		max_seats: z.number().min(1, 'Max seats must be at least 1'),
		allow_multi: z.boolean(),
		is_active: z.boolean(),
		is_active_online: z.boolean()
	})
	.refine((data) => data.min_seats <= data.seats, {
		message: 'Default seats must be greater than or equal to min seats',
		path: ['seats']
	})
	.refine((data) => data.seats <= data.max_seats, {
		message: 'Default seats must be less than or equal to max seats',
		path: ['seats']
	})
	.refine((data) => data.min_seats <= data.max_seats, {
		message: 'Max seats must be greater than or equal to min seats',
		path: ['max_seats']
	});

export type TableFormData = z.infer<typeof tableSchema>