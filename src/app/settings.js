import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import ActionButton from '../components/ActionButton';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../constants/theme';

export default function Settings() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <PlaceholderScreen
      title="Settings"
      subtitle="Account, notification, security, and app preferences."
    >
      <View style={styles.sessionPanel}>
        <Text style={styles.sectionLabel}>Signed in as</Text>
        <Text style={styles.name}>{user?.name ?? 'D-Link Trader'}</Text>
        <Text style={styles.email}>{user?.email ?? 'Authenticated session'}</Text>
      </View>

      <ActionButton
        title="Log out"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  sessionPanel: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  email: {
    color: colors.textMuted,
    fontSize: 14,
  },
  logoutButton: {
    borderRadius: 8,
    marginTop: spacing.sm,
  },
});
