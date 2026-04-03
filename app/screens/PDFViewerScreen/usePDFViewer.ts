import { useStores } from "@/models"
import { api } from "@/services/api"
import { useState } from "react"
import { Platform, useWindowDimensions } from "react-native"

export function usePDFViewer() {
  const { authenticationStore, calibreRootStore } = useStores()
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary?.selectedBook
  const windowDimension = useWindowDimensions()

  const cachedPdfPath = selectedLibrary
    ? calibreRootStore.readingHistories.find((history) => {
        return (
          history.libraryId === selectedLibrary.id &&
          history.bookId === selectedBook?.id &&
          history.format === "PDF" &&
          history.cachedPath.length > 0
        )
      })?.cachedPath[0]
    : undefined

  // Get PDF source URL
  const sourceUri =
    !selectedBook || !selectedLibrary
      ? ""
      : Platform.OS !== "web" && cachedPdfPath
        ? cachedPdfPath
        : api.getInlineBookUrl("PDF", selectedBook.id, selectedLibrary.id)

  // Create authentication header for the current source URI
  const header: Record<string, string> | undefined =
    authenticationStore.isAuthenticated && sourceUri ? api.getAuthHeaders(sourceUri) : undefined

  // Remote API URL (always HTTP, never a local file path).
  // Used as a fallback when a cached native PDF file is no longer available.
  const remoteUri =
    !selectedBook || !selectedLibrary
      ? ""
      : api.getInlineBookUrl("PDF", selectedBook.id, selectedLibrary.id)

  // Create document file object for react-pdf (web)
  // rangeChunkSize を 512KB に拡大し、大きな画像ページでの Range Request 往復回数を削減する
  const documentFile = {
    url: sourceUri,
    httpHeaders: header,
    withCredentials: false,
    rangeChunkSize: 524288,
  }

  const calculatePageWidth = (isFacingPage: boolean, windowWidth: number): number => {
    if (isFacingPage) {
      return Math.max(Math.floor(windowWidth / 2), 1)
    }
    return Math.max(Math.floor(windowWidth), 1)
  }

  const calculatePageDimensions = (
    size: { width: number; height: number },
    windowWidth: number,
    windowHeight: number,
    _isFacingPage: boolean,
  ): { width: number; height: number } => {
    const safeWidth = Math.max(windowWidth, 1)
    const safeHeight = Math.max(windowHeight, 1)
    const scale = Math.min(safeWidth / size.width, safeHeight / size.height)

    return {
      width: Math.max(1, size.width * scale),
      height: Math.max(1, size.height * scale),
    }
  }

  return {
    selectedBook,
    totalPages,
    setTotalPages,
    header,
    sourceUri,
    remoteUri,
    documentFile,
    windowDimension,
    calculatePageWidth,
    calculatePageDimensions,
  }
}
