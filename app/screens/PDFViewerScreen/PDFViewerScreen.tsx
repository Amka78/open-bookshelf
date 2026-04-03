import { BookViewer, type RenderPageProps, Text } from "@/components"
import { PDFWebPage } from "@/library/PDF/PDFWebPage"
import { PDF } from "@/library/PDF/Pdf"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { logger } from "@/utils/logger"
import { File } from "expo-file-system"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { type FlexAlignType, StyleSheet, View, type ViewStyle } from "react-native"

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  const { initialPage, onPageChange } = useViewer()
  const [sourcePageSize, setSourcePageSize] = useState<{ width: number; height: number }>()
  const [pdfError, setPdfError] = useState<string | undefined>(undefined)
  const [pageCountPdfBase64, setPageCountPdfBase64] = useState<string | undefined>(undefined)

  const {
    selectedBook,
    totalPages,
    setTotalPages,
    windowDimension,
    calculatePageDimensions,
    sourceUri,
    remoteUri,
    header,
  } = pdfHook

  const isLocalPdfSource = sourceUri.startsWith("file://")

  const hasReadableLocalPdf = isLocalPdfSource ? new File(sourceUri).exists : false

  const viewerSourceUri =
    isLocalPdfSource && !hasReadableLocalPdf && remoteUri.length > 0 ? remoteUri : sourceUri

  const isViewerSourceLocalPdf = viewerSourceUri.startsWith("file://")

  const viewerPdfSource = {
    uri: viewerSourceUri,
    cache: true,
    headers: header,
  }

  useEffect(() => {
    setPdfError(undefined)

    if (isLocalPdfSource && !hasReadableLocalPdf && remoteUri.length > 0) {
      logger.warn("Cached PDF file is missing, falling back to remote source", {
        sourceUri,
        remoteUri,
      })
    }
  }, [hasReadableLocalPdf, isLocalPdfSource, remoteUri, sourceUri])

  useEffect(() => {
    let isActive = true

    setPageCountPdfBase64(undefined)

    if (!isViewerSourceLocalPdf) {
      return () => {
        isActive = false
      }
    }

    const pdfFile = new File(viewerSourceUri)
    if (!pdfFile.exists) {
      return () => {
        isActive = false
      }
    }

    pdfFile
      .base64()
      .then((base64) => {
        if (!isActive) return
        setPageCountPdfBase64(base64)
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        logger.warn("Failed to read PDF file for page count detection", {
          message,
          sourceUri: viewerSourceUri,
        })
      })

    return () => {
      isActive = false
    }
  }, [isViewerSourceLocalPdf, viewerSourceUri])

  const handleHiddenPdfLoadComplete = (numberOfPages: number) => {
    setTotalPages((prev) => Math.max(prev ?? 0, numberOfPages))
  }

  const handlePageLoadComplete = (
    numberOfPages: number,
    _path: string,
    size: { width: number; height: number },
  ) => {
    setTotalPages((prev) => Math.max(prev ?? 0, numberOfPages))

    setSourcePageSize((prev) => {
      if (prev && prev.width === size.width && prev.height === size.height) {
        return prev
      }

      return { height: size.height, width: size.width }
    })
  }

  const handlePageError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    logger.error("Failed to render PDF page", { message, sourceUri: viewerSourceUri })
    setPdfError(message)
  }

  const handleHiddenPageCountError = (message: string) => {
    logger.warn("Failed to detect PDF page count in hidden WebView", {
      message,
      sourceUri: viewerSourceUri,
    })
  }

  const renderPage = (renderProps: RenderPageProps) => {
    const imageSize =
      sourcePageSize &&
      calculatePageDimensions(
        sourcePageSize,
        renderProps.availableWidth,
        renderProps.availableHeight ?? windowDimension.height,
        false,
      )

    const pageAlignStyle: ViewStyle = {
      alignSelf: "center" as FlexAlignType,
      justifyContent: "center",
    }

    return (
      <PDF
        source={viewerPdfSource}
        style={[styles.page, pageAlignStyle, imageSize]}
        onLoadComplete={handlePageLoadComplete}
        onError={handlePageError}
        trustAllCerts={false}
        enablePaging={false}
        scrollEnabled={false}
        singlePage={true}
        page={renderProps.page + 1}
      />
    )
  }

  if (!selectedBook) return null

  if (pdfError) {
    return (
      <View style={styles.errorRoot}>
        <Text style={styles.errorText}>{pdfError}</Text>
      </View>
    )
  }

  const shouldRenderHiddenPageCounter =
    (totalPages === undefined || totalPages <= 1) &&
    (!isViewerSourceLocalPdf || pageCountPdfBase64 !== undefined)

  return (
    <View style={styles.fullscreen}>
      {shouldRenderHiddenPageCounter ? (
        <View style={styles.hiddenPdfWrapper} pointerEvents="none">
          <PDFWebPage
            uri={viewerSourceUri}
            pageNumber={1}
            headers={header}
            pdfBase64={pageCountPdfBase64}
            style={styles.hiddenPdfContent}
            onTotalPages={handleHiddenPdfLoadComplete}
            onError={handleHiddenPageCountError}
          />
        </View>
      ) : null}
      <BookViewer
        bookTitle={selectedBook.metaData.title}
        renderPage={renderPage}
        totalPage={totalPages ?? 1}
        initialPage={initialPage}
        onPageChange={onPageChange}
        performanceMode="pdf-single-page"
        disableNavigation={totalPages === undefined}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  errorRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#b00020",
  },
  page: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  hiddenPdfWrapper: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    zIndex: -1,
  },
  hiddenPdfContent: {
    width: 1,
    height: 1,
  },
})
