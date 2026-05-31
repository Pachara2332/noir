import { Redirect } from 'expo-router';
import { StateView } from '../ui/StateView';
import { useAuth } from '../core/auth/useAuth';

export default function Index() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return <StateView loading title="Preparing your private screening" />;
  }

  return <Redirect href={session ? '/(protected)/(tabs)' : '/auth/login'} />;
}
