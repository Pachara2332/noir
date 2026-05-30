import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';
import { Button } from './Button';

type StateViewProps = {
  title: string;
  message?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({ title, message, loading, actionLabel, onAction }: StateViewProps) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color={colors.gold} size="large" /> : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="ghost" style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});
