import { Link, router } from 'expo-router';
import { Clapperboard } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/hooks/useAuth';
import { colors } from '../../src/styles/theme';

function getAuthMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Please try again.';
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Email or password is incorrect, or this account has not confirmed email yet.';
  }
  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Please confirm your email before logging in.';
  }
  return message;
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(protected)/(tabs)');
    } catch (error) {
      Alert.alert('Login failed', getAuthMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false} contentStyle={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.brand}>
          <Clapperboard color={colors.gold} size={42} />
          <Text style={styles.logo}>NOIR</Text>
          <Text style={styles.subtitle}>Luxury cinema booking</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
          />
          <Button title="Login" onPress={submit} loading={loading} disabled={!email || !password} />
          <Link href="/auth/register" style={styles.link}>Create a Noir account</Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  inner: {
    gap: 34,
  },
  brand: {
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: 14,
  },
  input: {
    minHeight: 54,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: colors.text,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
  },
  link: {
    color: colors.gold,
    textAlign: 'center',
    fontWeight: '700',
    paddingTop: 10,
  },
});
