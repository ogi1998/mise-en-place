import { requireRestaurant } from '@/lib/require-restaurant';
import { getTables } from '@/services/manager/settings/tables/queries';
import { getServiceAreas } from '@/services/manager/settings/service-areas/queries';
import TablesShell from '@/components/manager/settings/TableShell';

export default async function TablesPage() {
	const { supabase, restaurantId } = await requireRestaurant();
	const [areas, tables] = await Promise.all([
		getServiceAreas(supabase, restaurantId),
		getTables(supabase, restaurantId)
	]);
	return <TablesShell initialAreas={areas} initialTables={tables} restaurantId={restaurantId} />;
}
