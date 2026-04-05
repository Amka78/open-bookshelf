import { Text } from "@/components"
import { useStores } from "@/models"
import { usePalette } from "@/theme"
import { logger } from "@/utils/logger"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState, type CSSProperties } from "react"
import { ActivityIndicator, useColorScheme } from "react-native"
import {
  type BookHtmlPageProps,
  calibreHtmlPageInteractionMessageType,
  calibreHtmlPageLongPressAction,
  calibreHtmlPageSelectionMessageType,
  calibreHtmlPageSizeMessageType,
  calibreHtmlPageTapAction,
  useCalibreHtmlDocument,
} from "./shared"

const FALLBACK_AUTO_HEIGHT = 320

export const BookHtmlPage = observer(function BookHtmlPage(props: BookHtmlPageProps) {
  const palette = usePalette()
  const colorScheme = useColorScheme()
  const { settingStore } = useStores()
  const viewerTheme = settingStore.viewerTheme
  const computedThemeMode =
    viewerTheme === "dark" ? "dark" : colorScheme === "dark" ? "dark" : "light"
  const { autoHeight, documentKey, error, html, loading } = useCalibreHtmlDocument({
    ...props,
    themeMode: computedThemeMode,
    themeTextColor: palette.textPrimary,
    themeLinkColor: palette.textPrimary,
    themeFallbackBackgroundColor: palette.bg0,
    viewerFontSizePt: settingStore.viewerFontSizePt,
    viewerTheme,
  })
  const [contentHeight, setContentHeight] = useState(FALLBACK_AUTO_HEIGHT)
  const { onLongPress, onPress, onTextSelect } = props

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        const payload =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : (event.data as Record<string, unknown>)

        if (
          payload?.type === calibreHtmlPageSizeMessageType &&
          payload?.key === documentKey &&
          typeof payload?.height === "number"
        ) {
          setContentHeight(Math.max(1, Math.ceil(payload.height)))
          return
        }

        if (
          payload?.type === calibreHtmlPageInteractionMessageType &&
          payload?.key === documentKey &&
          payload?.action === calibreHtmlPageTapAction
        ) {
          onPress?.()
          return
        }

        if (
          payload?.type === calibreHtmlPageInteractionMessageType &&
          payload?.key === documentKey &&
          payload?.action === calibreHtmlPageLongPressAction
        ) {
          onLongPress?.()
          return
        }

        if (
          payload?.type === calibreHtmlPageSelectionMessageType &&
          payload?.key === documentKey &&
          typeof payload?.text === "string"
        ) {
          onTextSelect?.(payload.text)
          return
        }
      } catch {
        // Ignore unrelated messages.
      }
    }

    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [documentKey, onLongPress, onPress, onTextSelect])

  const height = autoHeight ? Math.max(contentHeight, 1) : props.availableHeight ?? 1

  const containerStyle: CSSProperties = (() => {
    const alignSelf =
      props.pageType === "leftPage"
        ? "flex-end"
        : props.pageType === "rightPage"
          ? "flex-start"
          : undefined
    return {
      overflow: "hidden" as const,
      height,
      alignSelf,
      ...(typeof props.availableWidth === "number" ? { width: props.availableWidth } : {}),
    }
  })()

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={placeholderStyle}>
          <Text>{error}</Text>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={placeholderStyle}>
          <ActivityIndicator />
        </div>
      </div>
    )
  }

  if (!html) {
    return (
      <div style={containerStyle}>
        <div style={placeholderStyle}>
          <Text>Failed to load book page</Text>
        </div>
      </div>
    )
  }

  logger.debug("Rendering HTML content", { documentKey, height, html })

  const iframeKey = `${documentKey}-${settingStore.viewerFontSizePt}-${viewerTheme}`

  return (
    <div style={containerStyle}>
      <iframe
        key={iframeKey}
        srcDoc={html}
        sandbox="allow-same-origin allow-scripts"
        style={iframeStyle}
        scrolling={autoHeight ? "no" : "auto"}
        title={`book-html-page-${documentKey}`}
      />
    </div>
  )
})

const iframeStyle: CSSProperties = {
  border: 0,
  display: "block",
  height: "100%",
  width: "100%",
}

const placeholderStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: FALLBACK_AUTO_HEIGHT,
  paddingInline: 16,
  width: "100%",
}
