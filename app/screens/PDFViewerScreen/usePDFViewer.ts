import { useStores } from "@/models"
import { api } from "@/services/api"
import { useMemo, useState } from "react"
import { useWindowDimensions } from "react-native"

export function usePDFViewer() {
  const { authenticationStore, calibreRootStore } = useStores()
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)

  const selectedBook = calibreRootStore.selectedLibrary?.selectedBook
  const windowDimension = useWindowDimensions()

  // Create authentication header
  const header: Record<string, string> | undefined = useMemo(() => {
    if (authenticationStore.isAuthenticated) {
      return { Authorization: `Basic ${authenticationStore.token}` }
    }
    return undefined
  }, [authenticationStore.isAuthenticated, authenticationStore.token])

  // Get PDF source URL
  const sourceUri = useMemo(() => {
    if (!selectedBook) return ""
    return api.getInlineBookUrl("PDF", selectedBook.id)
  }, [selectedBook])

  // Create document file object for react-pdf (web)
  const documentFile = useMemo(
    () => ({
      url: sourceUri,
      httpHeaders: header,
      withCredentials: false,
    }),
    [header, sourceUri],
  )

  // Create native PDF source object
  const pdfSource = useMemo(
    () => ({
      uri: sourceUri,
      cache: true,
      headers: header,
    }),
    [sourceUri, header],
  )

  const handlePDFLoadComplete = (numberOfPages: number) => {
    if (!totalPages) {
      setTotalPages(numberOfPages)
    }
  }

  const calculatePageWidth = (isFacingPage: boolean, windowWidth: number): number => {
    if (isFacingPage) {
      return Math.max(Math.floor(windowWidth / 2) - 24, 1)
    }
    return Math.max(Math.floor(windowWidth) - 32, 1)
  }

  const calculatePageDimensions = (
    size: { width: number; height: number },
    windowWidth: number,
    windowHeight: number,
    isFacingPage: boolean,
  ): { width: number; height: number } => {
    let pdfHeight = size.height
    let pdfWidth = size.width

    if (size.height > windowHeight) {
      pdfWidth = pdfWidth * (windowHeight / size.height)
      pdfHeight = windowHeight
    }

    if (pdfWidth > windowWidth) {
      pdfWidth = windowWidth
    } else if (isFacingPage) {
      if (pdfWidth > windowWidth / 2) pdfWidth = windowWidth / 2
    }

    return { width: pdfWidth, height: pdfHeight }
  }

  return {
    selectedBook,
    totalPages,
    setTotalPages,
    header,
    sourceUri,
    documentFile,
    pdfSource,
    windowDimension,
    handlePDFLoadComplete,
    calculatePageWidth,
    calculatePageDimensions,
  }
}
