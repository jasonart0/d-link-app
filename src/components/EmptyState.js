import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function EmptyState({ title = 'No items', info = 'Nothing to show here yet.' }) {
  return (
    <View style={styles.container}>
      <View style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.info}>{info}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: theme.spacing.lg },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#f1f5f8',
    marginBottom: theme.spacing.sm
  },
  title: { fontSize: theme.typography.h2, color: theme.colors.textPrimary, fontWeight: '700' },
  info: { marginTop: 6, color: theme.colors.textSecondary }
})
