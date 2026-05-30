import { Redirect, Stack } from 'expo-router';
import { StateView } from '../../src/components/StateView';
import { useAuth } from '../../src/hooks/useAuth';
import { colors } from '../../src/styles/theme';

export default function ProtectedLayout() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return <StateView loading title="Checking your membership" />;
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.gold,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="movie/[id]" options={{ title: 'Movie' }} />
      <Stack.Screen name="showtime/[id]" options={{ title: 'Select Seats' }} />
    </Stack>
  );
}
