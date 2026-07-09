import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function StatCard({ title, value, delta, style }) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {delta != null && <Text style={[styles.delta, delta < 0 ? styles.down : styles.up]}>{delta}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    ...theme.shadows.subtle,
    marginBottom: theme.spacing.md
  },
  title: { color: theme.colors.textSecondary, fontSize: theme.typography.small },
  value: { color: theme.colors.textPrimary, fontSize: theme.typography.h2, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  delta: { fontSize: theme.typography.small, marginLeft: 8 },
  up: { color: theme.colors.success },
  down: { color: theme.colors.danger }
})
