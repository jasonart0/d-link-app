import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { screens } from '../constants/screens';
import { colors, spacing } from '../constants/theme';

export default function Login() {
  return (
    <ScreenShell
      title="Login"
      subtitle="Secure access point for the D-Line AI Trading Intelligence Platform."
    >
      <View style={styles.loginPanel}>
        <Text style={styles.label}>Authentication Placeholder</Text>
        <Text style={styles.copy}>
          Login controls will be connected when authentication services are ready.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.navList} showsVerticalScrollIndicator={false}>
        {screens.map((screen) => (
          <Link key={screen.route} href={screen.route} style={styles.link}>
            <Text style={styles.linkText}>{screen.name}</Text>
          </Link>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loginPanel: {
    gap: spacing.sm,
  },
  label: {
    color: colors.neonBlue,
    fontSize: 14,
    fontWeight: '700',
  },
  copy: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  navList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  link: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  linkText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
