import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { cache } from 'react';

export const requireRestaurant = cache(async () => {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) redirect('/login');

	const { data: profile } = await supabase
		.from('profiles')
		.select('restaurant_id')
		.eq('id', user.id)
		.single();

	if (!profile?.restaurant_id) redirect('/login');

	return { supabase, restaurantId: profile.restaurant_id };
});
