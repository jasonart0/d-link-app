import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '../constants/theme';

export function ScreenShell({ title, subtitle, children }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.glowBlue} />
      <View style={styles.glowGreen} />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>D-LINE AI TRADING INTELLIGENCE</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.panel}>
        {children || (
          <>
            <View style={styles.signalRow}>
              <Text style={styles.signalLabel}>Module Status</Text>
              <Text style={styles.signalValue}>Placeholder</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.body}>
              This screen is reserved for upcoming trading intelligence workflows.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 72,
  },
  glowBlue: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(32, 214, 255, 0.18)',
  },
  glowGreen: {
    position: 'absolute',
    bottom: 90,
    left: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(41, 255, 154, 0.12)',
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: 'rgba(11, 16, 32, 0.92)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.md,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  signalLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  signalValue: {
    color: colors.neonBlue,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
