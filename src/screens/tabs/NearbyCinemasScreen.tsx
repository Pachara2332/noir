import { MapPin, Navigation } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, View } from 'react-native';
// Metro resolves this to CinemaMap.web.tsx on web and CinemaMap.native.tsx on iOS/Android.
// @ts-expect-error TypeScript does not resolve React Native platform suffixes from this import.
import { CinemaMap } from '../../ui/CinemaMap';
import { Screen } from '../../ui/Screen';
import { StateView } from '../../ui/StateView';
import { useNearby } from '../../api/useNearby';
import { colors } from '../../core/theme';

export default function NearbyCinemasScreen() {
  const { cinemas, location, loading, error, refresh } = useNearby();

  if (loading) return <StateView loading title="Finding nearby cinemas" />;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Cinemas</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <CinemaMap cinemas={cinemas} userLocation={location} />
      <FlatList
        data={cinemas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<StateView title="No cinemas found" message="Please try again in a moment." actionLabel="Retry" onAction={refresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <MapPin color={colors.gold} size={20} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
              <View style={styles.distanceRow}>
                <Navigation color={colors.gold} size={14} />
                <Text style={styles.distance}>{item.distanceKm === null ? 'Distance unavailable' : `${item.distanceKm.toFixed(1)} km away`}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  error: {
    color: colors.red,
    fontWeight: '700',
  },
  list: {
    gap: 12,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  address: {
    color: colors.muted,
    lineHeight: 19,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distance: {
    color: colors.gold,
    fontWeight: '800',
  },
});
