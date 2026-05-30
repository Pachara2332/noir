import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MovieCard } from '../../../src/components/MovieCard';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { supabase } from '../../../src/lib/supabase';
import { colors } from '../../../src/styles/theme';
import { Movie } from '../../../src/types/database';

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
      <View style={styles.header}>
        <Text style={styles.eyebrow}>NOIR SELECTION</Text>
        <Text style={styles.title}>Now Playing</Text>
      </View>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MovieCard movie={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
        ListEmptyComponent={<StateView title="No movies yet" message="Add seed data in Supabase to start booking." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  header: {
    paddingBottom: 4,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },
  list: {
    paddingBottom: 120,
  },
  separator: {
    height: 14,
  },
});
