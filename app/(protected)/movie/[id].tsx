import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Bookmark, ChevronLeft, Clock, MapPin, Play, Star } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const days = useMemo(() => {
    return showtimes.slice(0, 4).map((showtime) => {
      const date = new Date(showtime.starts_at);
      return {
        key: showtime.id,
        month: date.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
        day: date.getDate(),
        weekday: date.toLocaleString(undefined, { weekday: 'short' }).toUpperCase(),
      };
    });
  }, [showtimes]);

  if (loading) return <StateView loading title="Loading feature presentation" />;
  if (error) return <StateView title="Could not load movie" message={error} actionLabel="Retry" onAction={load} />;
  if (!movie) return <StateView title="Movie not found" />;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(protected)/(tabs)');
  }

  const selectedShowtime = showtimes[0];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={goBack} style={styles.iconButton}>
          <ChevronLeft color={colors.gold} size={26} />
        </Pressable>
        <Text style={styles.logo}>NOIR</Text>
        <View style={styles.avatar} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.posterHero}>
          <Image source={{ uri: movie.backdrop_url ?? movie.poster_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.heroShade} />
        </View>

        <View style={styles.metaLine}>
          <Text style={styles.rating}>{movie.rating}</Text>
          <Text style={styles.metaText}>DRAMA</Text>
          <Text style={styles.metaText}>{Math.floor(movie.duration_minutes / 60)}H {movie.duration_minutes % 60}M</Text>
        </View>
        <Text style={styles.title}>{movie.title}</Text>
        <View style={styles.actionLine}>
          <Star color={colors.gold} fill={colors.gold} size={14} />
          <Text style={styles.actionText}>9.4</Text>
          <Clock color={colors.gold} size={14} />
          <Text style={styles.actionText}>WATCH TRAILER</Text>
        </View>

        <Text style={styles.sectionKicker}>SYNOPSIS</Text>
        <Text style={styles.quote}>"A masterpiece of emotional resonance and architectural beauty."</Text>
        <Text style={styles.synopsis}>{movie.synopsis}</Text>

        <Text style={styles.sectionKicker}>SHOWTIMES</Text>
        <View style={styles.venueRow}>
          <View style={styles.venueName}>
            <MapPin color={colors.gold} size={17} />
            <Text style={styles.venue}>{selectedShowtime?.cinemas?.name ?? 'Select venue'}</Text>
          </View>
          <Text style={styles.changeVenue}>CHANGE VENUE</Text>
        </View>

        <View style={styles.days}>
          {days.map((day, index) => (
            <View key={day.key} style={[styles.dayPill, index === 0 && styles.activeDayPill]}>
              <Text style={[styles.dayMonth, index === 0 && styles.activeDayText]}>{day.month}</Text>
              <Text style={[styles.dayNumber, index === 0 && styles.activeDayText]}>{day.day}</Text>
              <Text style={[styles.dayWeek, index === 0 && styles.activeDayText]}>{index === 0 ? 'TODAY' : day.weekday}</Text>
            </View>
          ))}
        </View>

        <View style={styles.times}>
          {showtimes.slice(0, 4).map((showtime, index) => (
            <Link key={showtime.id} href={`/(protected)/showtime/${showtime.id}`} asChild>
              <Pressable style={StyleSheet.flatten([styles.timeCard, index === 2 && styles.activeTimeCard])}>
                <Text style={styles.time}>{new Date(showtime.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.timeType}>{showtime.auditorium}</Text>
              </Pressable>
            </Link>
          ))}
        </View>

        <Text style={styles.sectionKicker}>CAST & DIRECTOR</Text>
        <View style={styles.castRow}>
          {['Evelyn Thorne', 'Marcus Vane', 'Clara Rose'].map((name, index) => (
            <View key={name} style={styles.castItem}>
              <Image source={{ uri: `https://i.pravatar.cc/160?img=${index + 12}` }} style={styles.castImage} />
              <Text style={styles.castName}>{name}</Text>
              <Text style={styles.castRole}>{index === 0 ? 'DIRECTOR' : index === 1 ? 'JULIAN' : 'ELENA'}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.reserveBar}>
        <Pressable style={styles.bookmarkButton}>
          <Bookmark color={colors.gold} size={22} />
        </Pressable>
        {selectedShowtime ? (
          <Link href={`/(protected)/showtime/${selectedShowtime.id}`} asChild>
            <Pressable style={styles.reserveButton}>
              <Text style={styles.reserveText}>Reserve Seats</Text>
              <Play color={colors.background} fill={colors.background} size={19} />
            </Pressable>
          </Link>
        ) : (
          <View style={[styles.reserveButton, styles.reserveDisabled]}>
            <Text style={styles.reserveText}>No Showtimes</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(16,16,16,0.96)',
  },
  iconButton: { width: 38, height: 38, justifyContent: 'center' },
  logo: { color: colors.gold, fontSize: 23, fontWeight: '900', fontFamily: 'serif' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1 },
  content: { paddingBottom: 86 },
  posterHero: { height: 168, marginHorizontal: 12, borderRadius: 4, overflow: 'hidden' },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  metaLine: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 18, paddingHorizontal: 16 },
  rating: { color: colors.background, backgroundColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: '900' },
  metaText: { color: colors.text, fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: colors.gold, fontSize: 29, lineHeight: 31, fontWeight: '900', fontStyle: 'italic', fontFamily: 'serif', paddingHorizontal: 16, marginTop: 7 },
  actionLine: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, marginTop: 14 },
  actionText: { color: colors.text, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  sectionKicker: { color: colors.gold, fontSize: 10, marginTop: 20, marginBottom: 9, paddingHorizontal: 16 },
  quote: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '900', fontStyle: 'italic', fontFamily: 'serif', paddingHorizontal: 16 },
  synopsis: { color: colors.text, fontSize: 14, lineHeight: 22, paddingHorizontal: 16, marginTop: 13 },
  venueRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, paddingHorizontal: 16, alignItems: 'center' },
  venueName: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
  venue: { flex: 1, color: colors.text, fontSize: 18, lineHeight: 21, fontWeight: '900', fontFamily: 'serif' },
  changeVenue: { color: colors.gold, fontSize: 10, fontWeight: '900', maxWidth: 64, textAlign: 'center', borderBottomColor: colors.gold, borderBottomWidth: 1, paddingBottom: 6 },
  days: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 15 },
  dayPill: { flex: 1, minHeight: 56, borderRadius: 7, borderColor: colors.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 1, backgroundColor: '#0d0d0d' },
  activeDayPill: { backgroundColor: colors.gold, borderColor: colors.gold },
  dayMonth: { color: colors.muted, fontSize: 11, letterSpacing: 2 },
  dayNumber: { color: colors.text, fontSize: 19, fontWeight: '900', fontFamily: 'serif' },
  dayWeek: { color: colors.text, fontSize: 10, fontWeight: '900' },
  activeDayText: { color: colors.background },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  timeCard: { width: '48%', minHeight: 52, borderRadius: 4, borderColor: colors.borderBright, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d' },
  activeTimeCard: { backgroundColor: colors.panelSoft, borderColor: colors.gold },
  time: { color: colors.gold, fontSize: 16, fontWeight: '900', fontFamily: 'serif' },
  timeType: { color: colors.text, fontSize: 11, fontWeight: '800', marginTop: 3 },
  castRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  castItem: { width: 82, alignItems: 'center', gap: 6 },
  castImage: { width: 50, height: 50, borderRadius: 8, borderColor: colors.borderBright, borderWidth: 1 },
  castName: { color: colors.text, textAlign: 'center', fontWeight: '900', fontSize: 12 },
  castRole: { color: colors.text, textAlign: 'center', fontSize: 10, letterSpacing: 1.5 },
  reserveBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, paddingBottom: 13, flexDirection: 'row', gap: 8, backgroundColor: 'rgba(5,5,5,0.96)', borderTopColor: colors.border, borderTopWidth: 1 },
  bookmarkButton: { width: 38, height: 38, borderRadius: 7, borderColor: colors.borderBright, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  reserveButton: { flex: 1, height: 38, borderRadius: 8, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  reserveDisabled: { opacity: 0.5 },
  reserveText: { color: colors.background, fontSize: 15, fontWeight: '900', fontFamily: 'serif' },
});
