import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function LoadingState({ message = 'Loading…' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg
  },
  text: { marginTop: 12, color: theme.colors.textSecondary }
})
