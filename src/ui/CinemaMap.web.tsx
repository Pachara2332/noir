import { MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import { createElement } from 'react';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { getMapTilerStaticUrl } from '../core/config/maps';
import { colors } from '../core/theme';
import { NearbyCinema } from '../types/database';

type CinemaMapProps = {
  cinemas: NearbyCinema[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedCinemaId?: string | null;
  onSelectCinema?: (cinemaId: string) => void;
};

export function CinemaMap({ cinemas, userLocation, selectedCinemaId, onSelectCinema }: CinemaMapProps) {
  const center = userLocation ?? cinemas[0] ?? { latitude: 13.7563, longitude: 100.5018 };
  const staticMapUrl = getMapTilerStaticUrl(center.latitude, center.longitude);
  const plottedCinemas = cinemas.length ? cinemas : [];
  const latitudes = plottedCinemas.map((cinema) => cinema.latitude);
  const longitudes = plottedCinemas.map((cinema) => cinema.longitude);
  const minLat = Math.min(...latitudes, 5.6);
  const maxLat = Math.max(...latitudes, 20.5);
  const minLng = Math.min(...longitudes, 97.2);
  const maxLng = Math.max(...longitudes, 105.7);
  const padding = 0.14;
  const bbox = [
    minLng - (maxLng - minLng) * padding,
    minLat - (maxLat - minLat) * padding,
    maxLng + (maxLng - minLng) * padding,
    maxLat + (maxLat - minLat) * padding,
  ].join('%2C');
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.latitude}%2C${center.longitude}`;

  return (
    <View style={styles.map}>
      {staticMapUrl ? <Image source={{ uri: staticMapUrl }} style={styles.staticMap} contentFit="cover" /> : null}
      {!staticMapUrl
        ? createElement('iframe', {
            src: osmUrl,
            title: 'Cinema map',
            style: styles.iframe,
            loading: 'lazy',
          })
        : null}
      <View style={styles.scrim} pointerEvents="none" />
      <View style={styles.markerLayer}>
          {plottedCinemas.map((cinema) => {
            const left = `${((cinema.longitude - minLng) / Math.max(maxLng - minLng, 1)) * 78 + 11}%` as DimensionValue;
            const top = `${(1 - (cinema.latitude - minLat) / Math.max(maxLat - minLat, 1)) * 78 + 11}%` as DimensionValue;
            const selected = cinema.id === selectedCinemaId;
            return (
              <Pressable
                key={cinema.id}
                onPress={() => onSelectCinema?.(cinema.id)}
                style={[styles.marker, { left, top }, selected ? styles.selectedMarker : styles.defaultMarker]}
              >
                <MapPin color={selected ? colors.background : colors.text} size={15} />
              </Pressable>
            );
          })}
      </View>
      <View style={styles.infoPanel} pointerEvents="none">
        <View style={styles.centerPin}>
          <MapPin color={colors.gold} size={18} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.title}>Cinema map</Text>
          <Text style={styles.meta}>
            {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
      {/* Keep the icon package in this component for native-like visual parity. */}
      <View style={styles.hiddenIcon}>
        <MapPin color={colors.gold} size={30} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 260,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
  },
  iframe: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  staticMap: {
    ...StyleSheet.absoluteFill,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  markerLayer: {
    ...StyleSheet.absoluteFill,
  },
  marker: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  defaultMarker: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.gold,
  },
  selectedMarker: {
    backgroundColor: colors.gold,
    borderColor: '#fff2b2',
  },
  centerPin: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.borderBright,
    borderWidth: 1,
  },
  infoPanel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: 'rgba(5,5,5,0.82)',
    borderColor: colors.border,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  infoText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  meta: {
    color: colors.gold,
    fontWeight: '800',
    marginTop: 2,
  },
  hiddenIcon: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
