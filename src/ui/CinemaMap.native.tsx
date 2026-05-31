import MapView, { Marker, UrlTile } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { colors } from '../core/theme';
import { NearbyCinema } from '../types/database';
import { getMapTilerTileUrl } from '../core/config/maps';

type CinemaMapProps = {
  cinemas: NearbyCinema[];
  userLocation: { latitude: number; longitude: number } | null;
};

export function CinemaMap({ cinemas, userLocation }: CinemaMapProps) {
  const tileUrl = getMapTilerTileUrl();
  const initialRegion = {
    latitude: userLocation?.latitude ?? cinemas[0]?.latitude ?? 13.7563,
    longitude: userLocation?.longitude ?? cinemas[0]?.longitude ?? 100.5018,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation={Boolean(userLocation)}
      mapType={tileUrl ? 'none' : 'standard'}
    >
      {tileUrl ? <UrlTile urlTemplate={tileUrl} maximumZ={19} flipY={false} /> : null}
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
  );
}

const styles = StyleSheet.create({
  map: {
    height: 260,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
