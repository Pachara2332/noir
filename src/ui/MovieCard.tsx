import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../core/theme';
import { Movie } from '../types/database';

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/(protected)/movie/${movie.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.poster}>
          <Image source={{ uri: movie.poster_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
          <View style={styles.posterBorder} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{movie.rating}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
        <Text style={styles.genre} numberOfLines={1}>{movie.genre}</Text>
        <View style={styles.metaRow}>
          <Clock color={colors.muted} size={12} />
          <Text style={styles.meta}>{movie.duration_minutes} min</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 5,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  poster: {
    aspectRatio: 0.7,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: colors.panel,
  },
  posterBorder: {
    ...StyleSheet.absoluteFill,
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: colors.gold,
    borderTopLeftRadius: 10,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
  },
  genre: {
    color: colors.muted,
    fontSize: 12,
  },
});
