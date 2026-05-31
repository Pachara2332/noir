import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../core/auth/useAuth';
import { colors } from '../core/theme';
import { Stack } from 'expo-router';

const noirTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.panel,
    border: colors.border,
    primary: colors.gold,
    text: colors.text,
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={noirTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </ThemeProvider>
    </AuthProvider>
  );
}
