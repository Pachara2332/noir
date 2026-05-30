import { router } from 'expo-router';
import { LogOut, Ticket } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { useAuth } from '../../../src/hooks/useAuth';
import { supabase } from '../../../src/lib/supabase';
import { colors } from '../../../src/styles/theme';
import { Booking } from '../../../src/types/database';

export default function TicketsScreen() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const { data, error: ticketError } = await supabase
      .from('bookings')
      .select('*, showtimes(*, movies(*), cinemas(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (ticketError) setError(ticketError.message);
    else setTickets((data ?? []) as Booking[]);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await signOut();
    router.replace('/auth/login');
  }

  if (loading) return <StateView loading title="Loading your tickets" />;
  if (error) return <StateView title="Could not load tickets" message={error} actionLabel="Retry" onAction={() => load()} />;

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Tickets</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
        <Pressable onPress={logout} style={styles.logout}>
          <LogOut color={colors.gold} size={20} />
        </Pressable>
      </View>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
        ListEmptyComponent={<StateView title="No tickets yet" message="Book a showtime and your ticket will appear here." />}
        renderItem={({ item }) => {
          const showtime = item.showtimes;
          return (
            <View style={styles.ticket}>
              <View style={styles.ticketIcon}>
                <Ticket color={colors.background} size={22} />
              </View>
              <View style={styles.ticketBody}>
                <Text style={styles.movie}>{showtime?.movies?.title ?? 'Movie'}</Text>
                <Text style={styles.meta}>{showtime?.cinemas?.name ?? 'Cinema'} · {showtime?.auditorium ?? 'Auditorium'}</Text>
                <Text style={styles.meta}>{showtime?.starts_at ? new Date(showtime.starts_at).toLocaleString() : 'Showtime'}</Text>
                <Text style={styles.seats}>Seats {item.seat_labels.join(', ')}</Text>
              </View>
              <Text style={styles.price}>฿{item.total_price.toFixed(0)}</Text>
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
  },
  logout: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
  },
  list: {
    gap: 12,
    paddingBottom: 120,
  },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.panel,
    borderColor: colors.borderBright,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  ticketIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBody: {
    flex: 1,
    gap: 4,
  },
  movie: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  seats: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 13,
  },
  price: {
    color: colors.gold,
    fontWeight: '900',
  },
});
