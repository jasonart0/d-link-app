import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function MetricRow({ label, value, suffix, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}{suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { color: theme.colors.textSecondary },
  value: { color: theme.colors.textPrimary, fontWeight: '700' },
  suffix: { color: theme.colors.textSecondary, fontWeight: '500' }
})
