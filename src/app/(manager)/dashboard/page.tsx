import Link from 'next/link';
import { CalendarDays, Users, XCircle, Clock, ArrowRight } from 'lucide-react';
import StatCard from '@/components/manager/dashboard/StatCard';
import BookingsTable from '@/components/manager/dashboard/BookingsTable';
import UpcomingList from '@/components/manager/dashboard/UpcomingList';
import { getTodayBookings, getUpcomingBookings, getCancellationCount } from '@/services/manager/dashboard/queries';
import { getGreeting } from '@/services/manager/dashboard/utils';
import { requireRestaurant } from '@/lib/require-restaurant';

export default async function DashboardPage() {
  const { supabase, restaurantId } = await requireRestaurant();

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('restaurant_id', restaurantId)
    .single();

  const todayDate = new Date().toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  const futureEnd = new Date();
  futureEnd.setDate(futureEnd.getDate() + 5);
  const futureEndDate = futureEnd.toISOString().split('T')[0];

  const [todayBookings, upcomingBookings, cancellationsToday] = await Promise.all([
    getTodayBookings(supabase, restaurantId, todayDate),
    getUpcomingBookings(supabase, restaurantId, tomorrowDate, futureEndDate),
    getCancellationCount(supabase, restaurantId, todayDate)
  ]);

  const totalCoversToday = todayBookings.reduce((sum, b) => sum + b.party_size, 0);
  const pendingCount = todayBookings.filter((b) => b.status === 'pending').length;

  const todayLabel = new Date().toLocaleDateString('sl-SI', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className='mx-auto max-w-5xl space-y-8'>
      <div>
        <h1 className='font-serif text-[26px] font-normal text-[#1a1a18]'>
          Good {getGreeting()}, {profile?.first_name ?? 'Manager'}.
        </h1>
        <p className='mt-0.5 text-[13px] capitalize text-black/40'>{todayLabel}</p>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard label='Bookings today' value={todayBookings.length} icon={CalendarDays} accent='#3d7a5a' />
        <StatCard label='Covers today' value={totalCoversToday} icon={Users} accent='#2a5c8a' />
        <StatCard label='Cancellations' value={cancellationsToday} icon={XCircle} accent='#b04a4a' />
        <StatCard label='Pending confirmation' value={pendingCount} icon={Clock} accent='#8a6a2a' />
      </div>

      <section>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-[13px] font-medium uppercase tracking-widest text-black/30'>
            Today's bookings
          </h2>
          <Link
            href='/timetable'
            className='flex items-center gap-1 rounded-md bg-[#1a1a18] px-3 py-1.5 text-[11px] font-medium text-[#faf9f6] transition-opacity hover:opacity-80'>
            Open Timetable
            <ArrowRight className='h-3 w-3' />
          </Link>
        </div>
        <BookingsTable bookings={todayBookings} />
      </section>

      <UpcomingList bookings={upcomingBookings} />
    </div>
  );
}