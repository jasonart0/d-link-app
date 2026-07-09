import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import theme from '../constants/theme'

export default function AppScreen({ children, style, contentContainerStyle }) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  content: {
    padding: theme.spacing.md
  },
  inner: {
    flex: 1
  }
})
