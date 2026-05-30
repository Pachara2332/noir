import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { supabase } from '../../../src/lib/supabase';
import { colors } from '../../../src/styles/theme';
import { Movie, Showtime } from '../../../src/types/database';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const [{ data: movieData, error: movieError }, { data: showtimeData, error: showtimeError }] = await Promise.all([
      supabase.from('movies').select('*').eq('id', id).single(),
      supabase
        .from('showtimes')
        .select('*, cinemas(*)')
        .eq('movie_id', id)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true }),
    ]);
    if (movieError || showtimeError) {
      setError(movieError?.message ?? showtimeError?.message ?? 'Unable to load movie.');
    } else {
      setMovie(movieData as Movie);
      setShowtimes((showtimeData ?? []) as Showtime[]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <StateView loading title="Loading feature presentation" />;
  if (error) return <StateView title="Could not load movie" message={error} actionLabel="Retry" onAction={load} />;
  if (!movie) return <StateView title="Movie not found" />;

  return (
    <Screen>
      <View style={styles.hero}>
        <Image source={{ uri: movie.backdrop_url ?? movie.poster_url }} style={styles.backdrop} contentFit="cover" />
        <View style={styles.overlay} />
        <View style={styles.heroCopy}>
          <Text style={styles.rating}>{movie.rating}</Text>
          <Text style={styles.title}>{movie.title}</Text>
          <View style={styles.metaRow}>
            <Clock color={colors.gold} size={16} />
            <Text style={styles.meta}>{movie.duration_minutes} min</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.meta}>{movie.genre}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Synopsis</Text>
      <Text style={styles.synopsis}>{movie.synopsis}</Text>
      <Text style={styles.sectionTitle}>Showtimes</Text>
      {showtimes.length === 0 ? (
        <StateView title="No showtimes" message="There are no upcoming showtimes for this movie." />
      ) : (
        <View style={styles.showtimes}>
          {showtimes.map((showtime) => (
            <Link key={showtime.id} href={`/(protected)/showtime/${showtime.id}`} asChild>
              <Pressable style={({ pressed }) => [styles.showtime, pressed && styles.pressed]}>
                <View style={styles.dateBox}>
                  <Calendar color={colors.background} size={18} />
                </View>
                <View style={styles.showtimeBody}>
                  <Text style={styles.time}>{new Date(showtime.starts_at).toLocaleString()}</Text>
                  <View style={styles.metaRow}>
                    <MapPin color={colors.gold} size={14} />
                    <Text style={styles.cinema} numberOfLines={1}>{showtime.cinemas?.name}</Text>
                  </View>
                  <Text style={styles.meta}>{showtime.auditorium} · from ฿{showtime.base_price.toFixed(0)}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 340,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.panel,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroCopy: {
    padding: 18,
    gap: 10,
  },
  rating: {
    alignSelf: 'flex-start',
    color: colors.background,
    backgroundColor: colors.gold,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    color: colors.muted,
    fontWeight: '700',
  },
  dot: {
    color: colors.gold,
  },
  sectionTitle: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  synopsis: {
    color: colors.text,
    lineHeight: 22,
    fontSize: 15,
  },
  showtimes: {
    gap: 12,
  },
  showtime: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  dateBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showtimeBody: {
    flex: 1,
    gap: 6,
  },
  time: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  cinema: {
    color: colors.gold,
    fontWeight: '800',
    flex: 1,
  },
});
