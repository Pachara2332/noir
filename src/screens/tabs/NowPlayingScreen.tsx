import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { QrCode, Sparkles, Ticket, UserRound } from 'lucide-react-native';
import { MovieCard } from '../../ui/MovieCard';
import { Screen } from '../../ui/Screen';
import { StateView } from '../../ui/StateView';
import { supabase } from '../../api/supabase';
import { colors } from '../../core/theme';
import { Movie } from '../../types/database';

export default function NowPlayingScreen() {
  const [category, setCategory] = useState<MovieCategory>('now');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const { data, error: movieError } = await supabase
      .from('movies')
      .select('*')
      .order('release_date', { ascending: false });
    if (movieError) setError(movieError.message);
    else setMovies((data ?? []) as Movie[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleMovies = useMemo(() => {
    const today = new Date();
    if (category === 'coming') return movies.filter((movie) => new Date(movie.release_date) > today);
    if (category === 'specials') return movies.filter((movie) => Number.parseFloat(movie.rating) >= 8);
    return movies.filter((movie) => new Date(movie.release_date) <= today);
  }, [category, movies]);

  if (loading) return <StateView loading title="Opening the curtain" />;
  if (error) return <StateView title="Could not load movies" message={error} actionLabel="Retry" onAction={() => load()} />;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>NOIR</Text>
        <View style={styles.quickActions}>
          <QuickAction label="Tickets" onPress={() => router.push('/(protected)/(tabs)/tickets')} icon={<QrCode color={colors.text} size={18} />} />
          <QuickAction label="Tickets" onPress={() => router.push('/(protected)/(tabs)/tickets')} icon={<Ticket color={colors.text} size={18} />} />
          <QuickAction label="Profile" onPress={() => router.push('/(protected)/(tabs)/profile')} icon={<UserRound color={colors.text} size={18} />} />
        </View>
      </View>
      <Text style={styles.title}>Movies</Text>
      <View style={styles.segment}>
        <CategoryTab active={category === 'now'} label="Now Playing" onPress={() => setCategory('now')} />
        <CategoryTab active={category === 'coming'} label="Coming Soon" onPress={() => setCategory('coming')} />
        <CategoryTab active={category === 'specials'} label="Specials" onPress={() => setCategory('specials')} />
      </View>
      <View style={styles.formats}>
        {['IMAX', 'Dolby Atmos', '4DX', 'VIP'].map((format) => <Text key={format} style={styles.format}>{format}</Text>)}
      </View>
      <FlatList
        data={visibleMovies}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MovieCard movie={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
        ListEmptyComponent={<StateView title="No movies in this category" message="Try another movie tab." />}
        ListFooterComponent={<ConciergeCard />}
      />
    </Screen>
  );
}

function ConciergeCard() {
  return (
    <View style={styles.concierge}>
      <Sparkles color={colors.gold} size={28} />
      <Text style={styles.conciergeTitle}>Noir Privileges</Text>
      <Text style={styles.conciergeCopy}>
        Private screenings, curated menus, and member-only cinema experiences.
      </Text>
      <Pressable
        onPress={() => Alert.alert('Noir Privileges', 'Member-only experiences are available through our concierge.')}
        style={styles.conciergeButton}
      >
        <Text style={styles.conciergeButtonText}>EXPLORE PRIVILEGES</Text>
      </Pressable>
    </View>
  );
}

type MovieCategory = 'now' | 'coming' | 'specials';

function CategoryTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.segmentItem}>
      <Text style={active ? styles.segmentActive : styles.segmentText}>{label}</Text>
    </Pressable>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.iconButton}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  logo: {
    color: colors.gold,
    fontSize: 29,
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: 0,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 8,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 28,
    padding: 4,
    backgroundColor: colors.panelSoft,
  },
  segmentActive: {
    borderRadius: 22,
    paddingVertical: 12,
    color: colors.background,
    backgroundColor: colors.gold,
    textAlign: 'center',
    fontWeight: '900',
  },
  segmentText: {
    paddingVertical: 12,
    color: colors.muted,
    textAlign: 'center',
    fontWeight: '800',
  },
  segmentItem: { flex: 1 },
  formats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  format: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 13,
  },
  list: {
    gap: 18,
    paddingBottom: 120,
  },
  row: {
    gap: 14,
  },
  separator: {
    height: 0,
  },
  concierge: {
    marginTop: 22,
    marginBottom: 20,
    minHeight: 166,
    borderRadius: 14,
    borderColor: colors.borderBright,
    borderWidth: 1,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  conciergeTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  conciergeCopy: {
    color: colors.text,
    lineHeight: 18,
    fontSize: 12,
    textAlign: 'center',
  },
  conciergeButton: {
    marginTop: 8,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderColor: colors.gold,
    borderWidth: 1,
  },
  conciergeButtonText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
