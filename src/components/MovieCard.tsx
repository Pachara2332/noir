import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Clock, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadows } from '../styles/theme';
import { Movie } from '../types/database';

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/(protected)/movie/${movie.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <Image source={{ uri: movie.poster_url }} style={styles.poster} contentFit="cover" transition={250} />
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={styles.badge}>{movie.rating}</Text>
            <View style={styles.iconText}>
              <Clock size={14} color={colors.gold} />
              <Text style={styles.meta}>{movie.duration_minutes} min</Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
          <Text style={styles.genre} numberOfLines={1}>{movie.genre}</Text>
          <View style={styles.iconText}>
            <Star size={14} color={colors.gold} fill={colors.gold} />
            <Text style={styles.meta}>Now Playing</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 178,
    ...shadows.gold,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  poster: {
    width: 118,
    minHeight: 178,
    backgroundColor: colors.slate,
  },
  body: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    color: colors.background,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '900',
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
  genre: {
    color: colors.muted,
    fontSize: 14,
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
});
