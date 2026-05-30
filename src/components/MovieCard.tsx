import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Clock, Heart } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';
import { Movie } from '../types/database';

type MovieCardProps = {
  movie: Movie;
  featured?: boolean;
};

export function MovieCard({ movie, featured = false }: MovieCardProps) {
  return (
    <Link href={`/(protected)/movie/${movie.id}`} asChild>
      <Pressable style={({ pressed }) => [featured ? styles.featuredCard : styles.card, pressed && styles.pressed]}>
        <Image source={{ uri: movie.backdrop_url ?? movie.poster_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        <View style={styles.tint} />
        <Pressable style={styles.heart} pointerEvents="none">
          <Heart color={colors.gold} size={18} />
        </Pressable>
        <View style={featured ? styles.featuredBody : styles.body}>
          <Text style={styles.rating}>{movie.rating}</Text>
          <Text style={featured ? styles.featuredTitle : styles.title} numberOfLines={featured ? 3 : 2}>
            {movie.title}
          </Text>
          <View style={styles.metaRow}>
            <Clock color={colors.gold} size={13} />
            <Text style={styles.meta}>{movie.duration_minutes} min</Text>
            <Text style={styles.meta}>{movie.genre}</Text>
          </View>
          <Text style={styles.synopsis} numberOfLines={featured ? 3 : 0}>{movie.synopsis}</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Book Now</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 206,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: colors.borderBright,
    borderWidth: 1,
    backgroundColor: colors.panel,
  },
  featuredCard: {
    minHeight: 318,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: colors.borderBright,
    borderWidth: 1,
    backgroundColor: colors.panel,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  heart: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: colors.borderBright,
    borderWidth: 1,
    backgroundColor: 'rgba(5,5,5,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    gap: 6,
  },
  featuredBody: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
    gap: 6,
  },
  rating: {
    alignSelf: 'flex-start',
    color: colors.background,
    backgroundColor: colors.gold,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 29,
    lineHeight: 31,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  synopsis: {
    color: colors.text,
    lineHeight: 17,
    maxWidth: 230,
    fontSize: 12,
  },
  button: {
    marginTop: 6,
    alignSelf: 'flex-start',
    minWidth: 100,
    height: 32,
    borderRadius: 3,
    borderColor: colors.gold,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,5,5,0.52)',
  },
  buttonText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'serif',
  },
});
