import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function ActionButton({ title, onPress, variant = 'primary', style, disabled }) {
  const bg = variant === 'primary' ? theme.colors.accent : variant === 'danger' ? theme.colors.danger : '#f1f5f8'
  const color = variant === 'primary' ? theme.colors.primary : variant === 'danger' ? '#fff' : theme.colors.textPrimary
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.6 : 1 }, style]}
    >
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: { fontSize: theme.typography.body, fontWeight: '700' }
})
