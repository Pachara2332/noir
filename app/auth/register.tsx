import { Link, router } from 'expo-router';
import { Crown } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/hooks/useAuth';
import { colors } from '../../src/styles/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const session = await signUp(email.trim(), password);
      if (session) {
        router.replace('/(protected)/(tabs)');
      } else {
        Alert.alert('Account created', 'Please confirm your email, then login.');
        router.replace('/auth/login');
      }
    } catch (error) {
      Alert.alert('Register failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false} contentStyle={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.brand}>
          <Crown color={colors.gold} size={42} />
          <Text style={styles.logo}>JOIN NOIR</Text>
          <Text style={styles.subtitle}>Reserve the best seat in the room</Text>
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
          <Button title="Create account" onPress={submit} loading={loading} disabled={!email || password.length < 6} />
          <Link href="/auth/login" style={styles.link}>Already have an account?</Link>
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
    fontSize: 38,
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
