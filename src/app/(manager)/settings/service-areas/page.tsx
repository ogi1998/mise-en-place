import { requireRestaurant } from '@/lib/require-restaurant';
import { getServiceAreas } from '@/services/manager/settings/queries';
import ServiceAreasShell from '@/components/manager/settings/ServiceAreasShell';

export default async function ServiceAreasPage() {
	const { supabase, restaurantId } = await requireRestaurant();
	const areas = await getServiceAreas(supabase, restaurantId);
	return <ServiceAreasShell initialAreas={areas} restaurantId={restaurantId} />;
}
