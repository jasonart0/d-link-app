import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export function PlaceholderScreen({ title, subtitle, children }) {
  const router = useRouter();
  const { isAuthenticated, isRestoring } = useAuth();

  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isRestoring, router]);

  if (isRestoring || !isAuthenticated) {
    return (
      <ScreenShell title="Securing Session" subtitle="Validating access before opening workspace.">
        <View style={styles.guard}>
          <ActivityIndicator color={colors.neonBlue} />
          <Text style={styles.guardText}>Checking authentication</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title={title} subtitle={subtitle}>
      {children}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  guard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  guardText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
