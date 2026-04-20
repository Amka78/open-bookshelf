import { Text } from "@/components"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native"
import {
  textBookViewerInteractionMessageType,
  textBookViewerLongPressAction,
  textBookViewerPaginationMessageType,
  textBookViewerSelectionMessageType,
  textBookViewerTapAction,
} from "./textBookHtml"
import {
  buildTextBookSpineCommandPayload,
  type TextBookSpineProps,
  useTextBookSpineDocument,
} from "./TextBookSpine.shared"

export const TextBookSpine = observer(function TextBookSpine(props: TextBookSpineProps) {
  const { documentKey, error, html, loading, viewerFontSizePt, viewerTheme } =
    useTextBookSpineDocument(props)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const webViewRef = useRef<{ injectJavaScript?: (script: string) => void } | null>(null)
  const [frameReady, setFrameReady] = useState(false)

  const handleMessagePayload = useCallback(
    (payload: Record<string, unknown>) => {
      if (payload?.key !== documentKey) {
        return
      }

      if (
        payload?.type === textBookViewerPaginationMessageType &&
        typeof payload?.currentPage === "number" &&
        typeof payload?.totalPages === "number"
      ) {
        props.onPaginationChange?.({
          currentPage: payload.currentPage,
          totalPages: payload.totalPages,
        })
        return
      }

      if (
        payload?.type === textBookViewerInteractionMessageType &&
        payload?.action === textBookViewerTapAction
      ) {
        props.onNavigate?.({
          x: typeof payload?.x === "number" ? payload.x : 0,
          y: typeof payload?.y === "number" ? payload.y : 0,
          width: typeof payload?.width === "number" ? payload.width : 1,
          height: typeof payload?.height === "number" ? payload.height : 1,
        })
        return
      }

      if (
        payload?.type === textBookViewerInteractionMessageType &&
        payload?.action === textBookViewerLongPressAction
      ) {
        props.onLongPress?.()
        return
      }

      if (
        payload?.type === textBookViewerSelectionMessageType &&
        typeof payload?.text === "string"
      ) {
        props.onTextSelect?.(payload.text)
      }
    },
    [documentKey, props],
  )

  const sendCommand = useCallback(() => {
    if (!frameReady) {
      return
    }

    const commandPayload = buildTextBookSpineCommandPayload({
      anchor: props.anchor,
      currentPage: props.currentPage,
      documentKey,
      leadingBlankPage: props.leadingBlankPage,
      pageDirection: props.pageDirection,
      readingStyle: props.readingStyle,
    })

    if (Platform.OS === "web") {
      iframeRef.current?.contentWindow?.postMessage(commandPayload, "*")
      return
    }

    webViewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent("message", { data: ${JSON.stringify(commandPayload)} })); true;`,
    )
  }, [
    documentKey,
    frameReady,
    props.anchor,
    props.currentPage,
    props.leadingBlankPage,
    props.pageDirection,
    props.readingStyle,
  ])

  useEffect(() => {
    setFrameReady(false)
  }, [documentKey, viewerFontSizePt, viewerTheme])

  useEffect(() => {
    if (Platform.OS !== "web") {
      return undefined
    }

    const onMessage = (event: MessageEvent) => {
      try {
        const payload =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : (event.data as Record<string, unknown>)
        handleMessagePayload(payload)
      } catch {
        // Ignore unrelated messages.
      }
    }

    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [handleMessagePayload])

  useEffect(() => {
    sendCommand()
  }, [sendCommand])

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text>{error}</Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <ActivityIndicator />
        </View>
      </View>
    )
  }

  if (!html) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text>Failed to load book page</Text>
        </View>
      </View>
    )
  }

  const contentKey = `${documentKey}-${viewerFontSizePt}-${viewerTheme}`
  const NativeWebView =
    Platform.OS === "web"
      ? null
      : (require("react-native-webview").WebView as React.ComponentType<Record<string, unknown>>)

  if (Platform.OS === "web") {
    return (
      <div style={webContainerStyle}>
        <iframe
          key={contentKey}
          ref={iframeRef}
          srcDoc={html}
          sandbox="allow-same-origin allow-scripts"
          style={iframeStyle}
          scrolling="auto"
          title={`text-book-spine-${documentKey}`}
          onLoad={() => {
            setFrameReady(true)
          }}
        />
      </div>
    )
  }

  return (
    <View style={styles.container}>
      <NativeWebView
        key={contentKey}
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webView}
        javaScriptEnabled
        forceDarkOn={false}
        scrollEnabled
        nestedScrollEnabled
        onLoadEnd={() => {
          setFrameReady(true)
        }}
        onMessage={(event: { nativeEvent: { data: string } }) => {
          try {
            handleMessagePayload(JSON.parse(event.nativeEvent.data))
          } catch {
            // Ignore unrelated messages.
          }
        }}
        onShouldStartLoadWithRequest={(request: { url: string }) => {
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
})

const webContainerStyle: CSSProperties = {
  flex: 1,
  overflow: "hidden",
  width: "100%",
}

const iframeStyle: CSSProperties = {
  border: 0,
  display: "block",
  height: "100%",
  width: "100%",
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  webView: {
    backgroundColor: "transparent",
    flex: 1,
  },
})
