import MapView, { Marker } from 'react-native-maps';
import { MapPin, Navigation } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { useNearby } from '../../../src/hooks/useNearby';
import { colors } from '../../../src/styles/theme';

export default function NearbyCinemasScreen() {
  const { cinemas, location, loading, error, refresh } = useNearby();

  if (loading) return <StateView loading title="Finding nearby cinemas" />;

  const initialRegion = {
    latitude: location?.latitude ?? cinemas[0]?.latitude ?? 13.7563,
    longitude: location?.longitude ?? cinemas[0]?.longitude ?? 100.5018,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Cinemas</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation={Boolean(location)}>
        {cinemas.map((cinema) => (
          <Marker
            key={cinema.id}
            coordinate={{ latitude: cinema.latitude, longitude: cinema.longitude }}
            title={cinema.name}
            description={cinema.address}
            pinColor={colors.gold}
          />
        ))}
      </MapView>
      <FlatList
        data={cinemas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<StateView title="No cinemas found" message="Add cinemas seed data to Supabase." actionLabel="Retry" onAction={refresh} />}
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
  map: {
    height: 260,
    borderRadius: 8,
    overflow: 'hidden',
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
