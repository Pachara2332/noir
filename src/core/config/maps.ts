import Constants from 'expo-constants';

export const maptilerKey =
  process.env.EXPO_PUBLIC_MAPTILER_KEY ??
  process.env.NEXT_PUBLIC_MAPTILER_KEY ??
  Constants.expoConfig?.extra?.maptilerKey;

export function getMapTilerTileUrl() {
  if (!maptilerKey) return null;
  return `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`;
}

export function getMapTilerStaticUrl(latitude: number, longitude: number) {
  if (!maptilerKey) return null;
  return `https://api.maptiler.com/maps/streets-v2/static/${longitude},${latitude},12/900x420.png?markers=${longitude},${latitude},gold&key=${maptilerKey}`;
}
