import { Text } from "@/components"
import { usePalette } from "@/theme"
import React, { useState } from "react"
import { ActivityIndicator, StyleSheet, View, type ViewStyle, useColorScheme } from "react-native"
import { WebView } from "react-native-webview"
import {
  type BookHtmlPageProps,
  calibreHtmlPageInteractionMessageType,
  calibreHtmlPageLongPressAction,
  calibreHtmlPageSizeMessageType,
  useCalibreHtmlDocument,
} from "./shared"

const FALLBACK_AUTO_HEIGHT = 320

export function BookHtmlPage(props: BookHtmlPageProps) {
  const palette = usePalette()
  const colorScheme = useColorScheme()
  const { autoHeight, documentKey, error, html, loading } = useCalibreHtmlDocument({
    ...props,
    themeMode: colorScheme === "dark" ? "dark" : "light",
    themeTextColor: palette.textPrimary,
    themeLinkColor: palette.textPrimary,
    themeFallbackBackgroundColor: palette.bg0,
  })
  const [contentHeight, setContentHeight] = useState(FALLBACK_AUTO_HEIGHT)

  const height = autoHeight ? Math.max(contentHeight, 1) : props.availableHeight ?? 1

  const sizeStyle: ViewStyle = {
    height,
    ...(typeof props.availableWidth === "number" ? { width: props.availableWidth } : {}),
  }
  const containerStyle = [styles.container, sizeStyle]

  if (error) {
    return (
      <View style={containerStyle}>
        <View style={styles.placeholder}>
          <Text>{error}</Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={styles.placeholder}>
          <ActivityIndicator />
        </View>
      </View>
    )
  }

  if (!html) {
    return (
      <View style={containerStyle}>
        <View style={styles.placeholder}>
          <Text>Failed to load book page</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={containerStyle}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webView}
        javaScriptEnabled
        scrollEnabled={!autoHeight}
        nestedScrollEnabled={!autoHeight}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data)
            if (
              data?.type === calibreHtmlPageSizeMessageType &&
              data?.key === documentKey &&
              typeof data?.height === "number"
            ) {
              setContentHeight(Math.max(1, Math.ceil(data.height)))
              return
            }

            if (
              data?.type === calibreHtmlPageInteractionMessageType &&
              data?.key === documentKey &&
              data?.action === calibreHtmlPageLongPressAction
            ) {
              props.onLongPress?.()
            }
          } catch {
            // Ignore non-size messages.
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          return (
            request.url.startsWith("about:blank") ||
            request.url.startsWith("data:text") ||
            request.url.startsWith("data:image") ||
            request.url.startsWith("data:font") ||
            request.url.startsWith("data:application")
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: FALLBACK_AUTO_HEIGHT,
    paddingHorizontal: 16,
  },
  webView: {
    backgroundColor: "transparent",
    flex: 1,
  },
})
