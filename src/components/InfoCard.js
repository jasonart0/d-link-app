import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function InfoCard({ title, subtitle, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.body}>{children}</View>
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
  title: { fontSize: theme.typography.h2, color: theme.colors.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
  body: { marginTop: 10 }
})
