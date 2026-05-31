import { LocateFixed, MapPin, Navigation, Search, Star } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';
// Metro resolves this to CinemaMap.web.tsx on web and CinemaMap.native.tsx on iOS/Android.
// @ts-expect-error TypeScript does not resolve React Native platform suffixes from this import.
import { CinemaMap } from '../../ui/CinemaMap';
import { Screen } from '../../ui/Screen';
import { StateView } from '../../ui/StateView';
import { useNearby } from '../../api/useNearby';
import { colors } from '../../core/theme';

export default function NearbyCinemasScreen() {
  const { cinemas, location, loading, error, refresh } = useNearby();
  const [query, setQuery] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CinemaTab>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const filteredCinemas = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return cinemas.filter((cinema) => {
      const matchesSearch = !keyword || `${cinema.name} ${cinema.address}`.toLowerCase().includes(keyword);
      if (activeTab === 'favorites') return matchesSearch && favoriteIds.includes(cinema.id);
      if (activeTab === 'recent') return matchesSearch && recentIds.includes(cinema.id);
      return matchesSearch;
    });
  }, [activeTab, cinemas, favoriteIds, query, recentIds]);

  function selectCinema(cinemaId: string) {
    setSelectedCinemaId(cinemaId);
    setRecentIds((current) => [cinemaId, ...current.filter((id) => id !== cinemaId)].slice(0, 5));
  }

  function toggleFavorite(cinemaId: string) {
    setFavoriteIds((current) =>
      current.includes(cinemaId) ? current.filter((id) => id !== cinemaId) : [...current, cinemaId],
    );
  }

  if (loading) return <StateView loading title="Finding nearby cinemas" />;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>DISCOVER NEARBY</Text>
          <Text style={styles.title}>Cinemas</Text>
        </View>
        <Pressable accessibilityLabel="Refresh nearby cinemas" onPress={refresh} style={styles.locationButton}>
          <LocateFixed color={colors.gold} size={18} />
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={styles.segment}>
        <CinemaTabButton active={activeTab === 'all'} label="All cinemas" onPress={() => setActiveTab('all')} />
        <CinemaTabButton active={activeTab === 'favorites'} label="Favorites" onPress={() => setActiveTab('favorites')} />
        <CinemaTabButton active={activeTab === 'recent'} label="Recent" onPress={() => setActiveTab('recent')} />
      </View>
      <View style={styles.searchBar}>
        <Search color={colors.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search cinema or area"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.mapShell}>
        <CinemaMap
          cinemas={filteredCinemas}
          userLocation={location}
          selectedCinemaId={selectedCinemaId}
          onSelectCinema={selectCinema}
        />
        <View style={styles.mapLabel}>
          <MapPin color={colors.background} size={16} />
          <Text style={styles.mapLabelText}>TAP A PIN</Text>
        </View>
      </View>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Nearby</Text>
        <Text style={styles.listCount}>{filteredCinemas.length} locations</Text>
      </View>
      <FlatList
        data={filteredCinemas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<StateView title="No cinemas found" message="Please try again in a moment." actionLabel="Retry" onAction={refresh} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => selectCinema(item.id)}
            style={[styles.card, selectedCinemaId === item.id && styles.selectedCard]}
          >
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
            <Pressable accessibilityLabel={`Favorite ${item.name}`} onPress={() => toggleFavorite(item.id)} hitSlop={10}>
              <Star color={colors.gold} fill={favoriteIds.includes(item.id) ? colors.gold : 'transparent'} size={19} />
            </Pressable>
          </Pressable>
        )}
      />
    </Screen>
  );
}

type CinemaTab = 'all' | 'favorites' | 'recent';

function CinemaTabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.segmentItem}>
      <Text style={active ? styles.segmentActive : styles.segmentText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  locationButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.panelSoft },
  error: {
    color: colors.red,
    fontWeight: '700',
  },
  segment: { flexDirection: 'row', borderRadius: 28, padding: 4, backgroundColor: colors.panelSoft },
  segmentActive: { flex: 1, borderRadius: 22, paddingVertical: 12, textAlign: 'center', color: colors.background, backgroundColor: colors.gold, fontWeight: '900' },
  segmentText: { flex: 1, paddingVertical: 12, textAlign: 'center', color: colors.muted, fontWeight: '800' },
  segmentItem: { flex: 1 },
  searchBar: { minHeight: 54, borderRadius: 14, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.panelSoft },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  mapShell: { position: 'relative' },
  mapLabel: { position: 'absolute', right: 12, bottom: 12, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gold },
  mapLabelText: { color: colors.background, fontSize: 10, fontWeight: '900' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  listTitle: { color: colors.text, fontSize: 25, fontWeight: '900' },
  listCount: { color: colors.muted, fontSize: 12 },
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
    borderRadius: 12,
    padding: 14,
  },
  selectedCard: { borderColor: colors.gold, backgroundColor: colors.panelSoft },
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
