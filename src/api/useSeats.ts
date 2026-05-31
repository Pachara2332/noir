import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { Seat } from '../types/database';

export function useSeats(showtimeId?: string) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!showtimeId) return;
    setLoading(true);
    setError(null);
    const { data, error: seatError } = await supabase
      .from('seats')
      .select('*')
      .eq('showtime_id', showtimeId)
      .order('row_label', { ascending: true })
      .order('seat_number', { ascending: true });
    if (seatError) {
      setError(seatError.message);
    } else {
      setSeats((data ?? []) as Seat[]);
    }
    setLoading(false);
  }, [showtimeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!showtimeId) return;
    const channel = supabase
      .channel(`seats:${showtimeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats', filter: `showtime_id=eq.${showtimeId}` },
        (payload) => {
          const next = payload.new as Seat | null;
          const oldSeat = payload.old as Seat | null;
          setSeats((current) => {
            if (payload.eventType === 'DELETE' && oldSeat) {
              return current.filter((seat) => seat.id !== oldSeat.id);
            }
            if (!next) return current;
            const exists = current.some((seat) => seat.id === next.id);
            const merged = exists ? current.map((seat) => (seat.id === next.id ? next : seat)) : [...current, next];
            return merged.sort((a, b) => a.row_label.localeCompare(b.row_label) || a.seat_number - b.seat_number);
          });
          if (next?.status === 'booked') {
            setSelectedSeatIds((current) => current.filter((id) => id !== next.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showtimeId]);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat.id)),
    [seats, selectedSeatIds],
  );

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status !== 'available') return;
    setSelectedSeatIds((current) =>
      current.includes(seat.id) ? current.filter((id) => id !== seat.id) : [...current, seat.id],
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedSeatIds([]), []);

  return {
    seats,
    selectedSeats,
    selectedSeatIds,
    loading,
    error,
    refresh: load,
    toggleSeat,
    clearSelection,
  };
}
