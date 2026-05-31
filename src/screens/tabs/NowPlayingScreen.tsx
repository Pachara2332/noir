import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Bell, ConciergeBell } from 'lucide-react-native';
import { MovieCard } from '../../ui/MovieCard';
import { Screen } from '../../ui/Screen';
import { StateView } from '../../ui/StateView';
import { supabase } from '../../api/supabase';
import { colors } from '../../core/theme';
import { Movie } from '../../types/database';

export default function NowPlayingScreen() {
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

  if (loading) return <StateView loading title="Opening the curtain" />;
  if (error) return <StateView title="Could not load movies" message={error} actionLabel="Retry" onAction={() => load()} />;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.kicker}>NOIR SELECTION</Text>
          <Text style={styles.logo}>NOIR</Text>
        </View>
        <View style={styles.iconButton}>
          <Bell color={colors.gold} size={17} />
        </View>
      </View>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>NOIR SELECTION</Text>
        <Text style={styles.title}>Now Playing</Text>
      </View>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <MovieCard movie={item} featured={index === 0} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
        ListEmptyComponent={<StateView title="No movies yet" message="New screenings will appear here soon." />}
        ListFooterComponent={<ConciergeCard />}
      />
    </Screen>
  );
}

function ConciergeCard() {
  return (
    <View style={styles.concierge}>
      <ConciergeBell color={colors.gold} size={30} />
      <Text style={styles.conciergeTitle}>Elevated Concierge</Text>
      <Text style={styles.conciergeCopy}>
        Experience cinema beyond the screen. Access private viewings, curated menus, and valet arrivals with your Noir Membership.
      </Text>
      <View style={styles.conciergeButton}>
        <Text style={styles.conciergeButtonText}>EXPLORE MEMBERSHIP</Text>
      </View>
    </View>
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
    paddingBottom: 10,
  },
  kicker: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  logo: {
    color: colors.gold,
    fontSize: 23,
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: 0,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingBottom: 4,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'serif',
    marginTop: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    paddingLeft: 12,
  },
  list: {
    gap: 18,
    paddingBottom: 120,
  },
  separator: {
    height: 0,
  },
  concierge: {
    marginTop: 22,
    marginBottom: 20,
    minHeight: 166,
    borderRadius: 8,
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
