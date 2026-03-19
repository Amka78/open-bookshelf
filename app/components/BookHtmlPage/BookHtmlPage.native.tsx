import { Text } from "@/components"
import React, { useMemo, useState } from "react"
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from "react-native"
import { WebView } from "react-native-webview"
import {
  type BookHtmlPageProps,
  calibreHtmlPageSizeMessageType,
  useCalibreHtmlDocument,
} from "./shared"

const FALLBACK_AUTO_HEIGHT = 320

export function BookHtmlPage(props: BookHtmlPageProps) {
  const { autoHeight, documentKey, error, html, loading } = useCalibreHtmlDocument(props)
  const [contentHeight, setContentHeight] = useState(FALLBACK_AUTO_HEIGHT)

  const height = autoHeight ? Math.max(contentHeight, 1) : props.availableHeight ?? 1

  const containerStyle = useMemo(() => {
    const sizeStyle: ViewStyle = {
      height,
      ...(typeof props.availableWidth === "number" ? { width: props.availableWidth } : {}),
    }

    return [styles.container, sizeStyle]
  }, [height, props.availableWidth])

  if (loading || !html) {
    return (
      <View style={containerStyle}>
        <View style={styles.placeholder}>
          <ActivityIndicator />
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={containerStyle}>
        <View style={styles.placeholder}>
          <Text>{error}</Text>
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
