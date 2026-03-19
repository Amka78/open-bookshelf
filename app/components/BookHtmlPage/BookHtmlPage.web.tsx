import { Text } from "@/components"
import { logger } from "@/utils/logger"
import React, { useEffect, useMemo, useState, type CSSProperties } from "react"
import { ActivityIndicator } from "react-native"
import {
  type BookHtmlPageProps,
  calibreHtmlPageSizeMessageType,
  useCalibreHtmlDocument,
} from "./shared"

const FALLBACK_AUTO_HEIGHT = 320

export function BookHtmlPage(props: BookHtmlPageProps) {
  const { autoHeight, documentKey, error, html, loading } = useCalibreHtmlDocument(props)
  const [contentHeight, setContentHeight] = useState(FALLBACK_AUTO_HEIGHT)

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
        }
      } catch {
        // Ignore unrelated messages.
      }
    }

    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [documentKey])

  const height = autoHeight ? Math.max(contentHeight, 1) : props.availableHeight ?? 1

  const containerStyle = useMemo<CSSProperties>(() => {
    return {
      overflow: "hidden",
      height,
      ...(typeof props.availableWidth === "number" ? { width: props.availableWidth } : {}),
    }
  }, [height, props.availableWidth])

  if (loading || !html) {
    return (
      <div style={containerStyle}>
        <div style={placeholderStyle}>
          <ActivityIndicator />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={placeholderStyle}>
          <Text>{error}</Text>
        </div>
      </div>
    )
  }

  logger.debug("Rendering HTML content", { documentKey, height })

  return (
    <div style={containerStyle}>
      <iframe
        key={documentKey}
        srcDoc={html}
        sandbox="allow-same-origin allow-scripts"
        style={iframeStyle}
        scrolling={autoHeight ? "no" : "auto"}
        title={`book-html-page-${documentKey}`}
      />
    </div>
  )
}

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
