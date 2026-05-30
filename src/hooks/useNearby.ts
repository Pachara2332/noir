import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cinema, NearbyCinema } from '../types/database';

const toRad = (value: number) => (value * Math.PI) / 180;

function distanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earthRadiusKm = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useNearby() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Location permission denied.');
      } else {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(current.coords);
      }

      const { data, error: cinemaError } = await supabase
        .from('cinemas')
        .select('*')
        .order('name', { ascending: true });
      if (cinemaError) throw cinemaError;
      setCinemas((data ?? []) as Cinema[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load cinemas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const nearby = useMemo<NearbyCinema[]>(() => {
    return cinemas
      .map((cinema) => ({
        ...cinema,
        distanceKm: location
          ? distanceKm(location.latitude, location.longitude, cinema.latitude, cinema.longitude)
          : null,
      }))
      .sort((a, b) => (a.distanceKm ?? Number.MAX_VALUE) - (b.distanceKm ?? Number.MAX_VALUE));
  }, [cinemas, location]);

  return { cinemas: nearby, location, loading, error, refresh: load };
}
