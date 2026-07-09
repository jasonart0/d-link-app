import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../constants/theme';

export default function Login() {
  const router = useRouter();
  const { signIn, isSigningIn, error, clearError } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLogin = async () => {
    clearError();
    setIsNavigating(true);

    try {
      await signIn();
      router.replace('/dashboard');
    } catch {
      // The auth context exposes a clean user-facing error message.
      setIsNavigating(false);
    }
  };

  const isSubmitting = isSigningIn || isNavigating;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>D-LINE AI TRADING INTELLIGENCE</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>Secure access for live model signals and risk controls.</Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.marketStrip}>
          <View style={styles.marketDot} />
          <Text style={styles.marketText}>API-gated trading workspace</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={false}
            keyboardType="email-address"
            onSubmitEditing={handleLogin}
            placeholder="Login disabled"
            placeholderTextColor={colors.textMuted}
            returnKeyType="next"
            style={styles.input}
            textContentType="emailAddress"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            editable={false}
            onSubmitEditing={handleLogin}
            placeholder="Login disabled"
            placeholderTextColor={colors.textMuted}
            returnKeyType="go"
            secureTextEntry
            style={styles.input}
            textContentType="password"
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          disabled={isSubmitting}
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.submitButton,
            (pressed || isSubmitting) && styles.submitButtonPressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitText}>Sign in</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 340,
  },
  panel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  marketStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  marketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neonGreen,
  },
  marketText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.55)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 77, 109, 0.10)',
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: colors.neonBlue,
  },
  submitButtonPressed: {
    opacity: 0.78,
  },
  submitText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '900',
  },
});
