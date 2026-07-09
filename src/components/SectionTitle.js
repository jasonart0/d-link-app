import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function SectionTitle({ title, actionLabel, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  title: { fontSize: theme.typography.h2, color: theme.colors.textPrimary, fontWeight: '700' },
  action: { color: theme.colors.accent, fontWeight: '700' }
})
