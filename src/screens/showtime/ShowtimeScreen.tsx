import { router, useLocalSearchParams } from 'expo-router';
import { Armchair, CheckCircle2 } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { SeatMap } from '../../ui/SeatMap';
import { StateView } from '../../ui/StateView';
import { useAuth } from '../../core/auth/useAuth';
import { useSeats } from '../../api/useSeats';
import { supabase } from '../../api/supabase';
import { colors } from '../../core/theme';
import { Showtime } from '../../types/database';

export default function ShowtimeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { seats, selectedSeats, selectedSeatIds, loading, error, toggleSeat, clearSelection, refresh } = useSeats(id);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [booking, setBooking] = useState(false);
  const [showtimeError, setShowtimeError] = useState<string | null>(null);

  const loadShowtime = useCallback(async () => {
    if (!id) return;
    setShowtimeError(null);
    const { data, error: nextError } = await supabase
      .from('showtimes')
      .select('*, movies(*), cinemas(*)')
      .eq('id', id)
      .single();
    if (nextError) setShowtimeError(nextError.message);
    else setShowtime(data as Showtime);
  }, [id]);

  useEffect(() => {
    loadShowtime();
  }, [loadShowtime]);

  const total = useMemo(() => {
    const base = showtime?.base_price ?? 0;
    return selectedSeats.reduce((sum, seat) => sum + base + seat.price_modifier, 0);
  }, [selectedSeats, showtime]);

  async function bookSeats() {
    if (!user || !id || selectedSeats.length === 0) return;
    setBooking(true);
    try {
      const { data: updatedSeats, error: seatError } = await supabase
        .from('seats')
        .update({ status: 'booked' })
        .eq('showtime_id', id)
        .eq('status', 'available')
        .in('id', selectedSeatIds)
        .select('id,label');

      if (seatError) throw seatError;
      if ((updatedSeats?.length ?? 0) !== selectedSeatIds.length) {
        await refresh();
        throw new Error('Some selected seats were just booked. Please choose again.');
      }

      const seatLabels = selectedSeats.map((seat) => seat.label).sort();
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          showtime_id: id,
          seat_ids: selectedSeatIds,
          seat_labels: seatLabels,
          total_price: total,
          status: 'confirmed',
        })
        .select('id')
        .single();
      if (bookingError) throw bookingError;

      await supabase.from('seats').update({ booking_id: bookingData.id }).in('id', selectedSeatIds);
      clearSelection();
      Alert.alert('Booking confirmed', `Seats ${seatLabels.join(', ')} are yours.`, [
        { text: 'View tickets', onPress: () => router.replace('/(protected)/(tabs)/tickets') },
      ]);
    } catch (err) {
      Alert.alert('Booking failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBooking(false);
    }
  }

  if (loading && !showtime) return <StateView loading title="Preparing seat map" />;
  if (error || showtimeError) {
    return <StateView title="Could not load seats" message={error ?? showtimeError ?? undefined} actionLabel="Retry" onAction={() => { refresh(); loadShowtime(); }} />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Armchair color={colors.gold} size={24} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.movie}>{showtime?.movies?.title ?? 'Showtime'}</Text>
          <Text style={styles.meta}>{showtime?.cinemas?.name}{' \u00b7 '}{showtime?.auditorium}</Text>
          <Text style={styles.meta}>{showtime?.starts_at ? new Date(showtime.starts_at).toLocaleString() : ''}</Text>
        </View>
      </View>

      {seats.length === 0 ? (
        <StateView title="No seats available" message="This auditorium is not ready for booking yet." actionLabel="Retry" onAction={refresh} />
      ) : (
        <SeatMap
          seats={seats}
          selectedSeatIds={selectedSeatIds}
          basePrice={showtime?.base_price ?? 0}
          onToggle={toggleSeat}
        />
      )}

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>Selected</Text>
          <Text style={styles.summaryValue}>{selectedSeats.length ? selectedSeats.map((seat) => seat.label).join(', ') : 'None'}</Text>
        </View>
        <View>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.total}>{'\u0e3f'}{total.toFixed(0)}</Text>
        </View>
      </View>

      <Button
        title="Confirm booking"
        onPress={bookSeats}
        loading={booking}
        disabled={selectedSeats.length === 0}
      />
      {booking ? (
        <View style={styles.bookingHint}>
          <CheckCircle2 color={colors.green} size={15} />
          <Text style={styles.bookingText}>Locking selected seats...</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  movie: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    color: colors.muted,
    fontWeight: '700',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '900',
    marginTop: 5,
    maxWidth: 220,
  },
  total: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  bookingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bookingText: {
    color: colors.green,
    fontWeight: '800',
  },
});
