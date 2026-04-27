import { useStores } from "@/models"
import type { BookReadingStyleType } from "@/type/types"
import { usePalette } from "@/theme"
import { useMemo, useRef } from "react"
import { useColorScheme } from "react-native"
import { usePreparedCalibreHtmlDocument } from "../BookHtmlPage/shared"
import {
  buildTextBookHtmlDocument,
  textBookViewerCommandMessageType,
} from "./textBookHtml"

export type TextBookSpineProps = {
  libraryId: string
  bookId: number
  format: string
  size: number
  hash: number
  pagePath: string
  headers?: Record<string, string>
  currentPage: number
  readingStyle: BookReadingStyleType
  pageDirection: "left" | "right"
  leadingBlankPage: boolean
  anchor?: string | null
  annotations?: Array<{ uuid: string; highlightedText: string | null; styleWhich: string | null }>
  onPaginationChange?: (payload: { currentPage: number; totalPages: number }) => void
  onNavigate?: (payload: { x: number; y: number; width: number; height: number }) => void
  onLongPress?: () => void
  onTextSelect?: (text: string) => void
  /** Pre-built HTML string. When provided, bypasses the Calibre API fetch (for stories/tests). */
  sourceHtml?: string
}

export const buildTextBookSpineCommandPayload = ({
  anchor,
  currentPage,
  documentKey,
  leadingBlankPage,
  pageDirection,
  readingStyle,
}: Pick<
  TextBookSpineProps,
  "anchor" | "currentPage" | "leadingBlankPage" | "pageDirection" | "readingStyle"
> & { documentKey: string }) => {
  return JSON.stringify({
    type: textBookViewerCommandMessageType,
    key: documentKey,
    page: currentPage,
    anchor: anchor ?? undefined,
    readingStyle,
    pageDirection,
    leadingBlankPage,
  })
}

export const useTextBookSpineDocument = (props: TextBookSpineProps) => {
  const palette = usePalette()
  const colorScheme = useColorScheme()
  const { settingStore } = useStores()
  const viewerTheme = settingStore.viewerTheme
  const computedThemeMode =
    viewerTheme === "dark" ? "dark" : colorScheme === "dark" ? "dark" : "light"

  const { documentKey, error, loading, preparedDocument } = usePreparedCalibreHtmlDocument(
    props.sourceHtml
      ? { libraryId: "", bookId: 0, format: "", size: 0, hash: 0, pagePath: props.pagePath }
      : {
          libraryId: props.libraryId,
          bookId: props.bookId,
          format: props.format,
          size: props.size,
          hash: props.hash,
          pagePath: props.pagePath,
          headers: props.headers,
        },
  )

  const initialViewerStateRef = useRef<{
    currentPage: number
    documentKey: string
    leadingBlankPage: boolean
    pageDirection: "left" | "right"
    readingStyle: BookReadingStyleType
  } | null>(null)

  if (initialViewerStateRef.current?.documentKey !== documentKey) {
    initialViewerStateRef.current = {
      documentKey,
      readingStyle: props.readingStyle,
      pageDirection: props.pageDirection,
      currentPage: props.currentPage,
      leadingBlankPage: props.leadingBlankPage,
    }
  }

  const html = useMemo(() => {
    if (props.sourceHtml) {
      return props.sourceHtml
    }

    if (!preparedDocument || !initialViewerStateRef.current) {
      return null
    }

    return buildTextBookHtmlDocument({
      documentData: preparedDocument,
      documentKey,
      annotations: props.annotations ?? [],
      appearance: {
        themeMode:
          viewerTheme === "dark"
            ? "dark"
            : viewerTheme === "sepia"
              ? "light"
              : computedThemeMode,
        textColor: palette.textPrimary,
        linkColor: palette.textPrimary,
        fallbackBackgroundColor: palette.bg0,
        viewerFontSizePt: settingStore.viewerFontSizePt,
        viewerTheme,
      },
      readingStyle: initialViewerStateRef.current.readingStyle,
      pageDirection: initialViewerStateRef.current.pageDirection,
      initialPage: initialViewerStateRef.current.currentPage,
      leadingBlankPage: initialViewerStateRef.current.leadingBlankPage,
    })
  }, [
    computedThemeMode,
    documentKey,
    palette.bg0,
    palette.textPrimary,
    preparedDocument,
    props.annotations,
    props.sourceHtml,
    settingStore.viewerFontSizePt,
    viewerTheme,
  ])

  return {
    documentKey: props.sourceHtml ? props.pagePath : documentKey,
    error: props.sourceHtml ? null : error,
    html,
    loading: props.sourceHtml ? false : loading,
    viewerFontSizePt: settingStore.viewerFontSizePt,
    viewerTheme,
  }
}
