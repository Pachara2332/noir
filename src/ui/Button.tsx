import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../core/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', style }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.background} /> : <Text style={variant === 'primary' ? styles.primaryText : styles.ghostText}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: colors.gold,
  },
  ghost: {
    borderColor: colors.borderBright,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  primaryText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 15,
  },
  ghostText: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
